#!/usr/bin/env node

const fs = require("fs").promises;
const path = require("path");
const { program } = require("commander");
const Handlebars = require("handlebars");
const chalk = require("chalk");

// Register Handlebars helpers
Handlebars.registerHelper("kebabCase", (str) => {
  return str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
});

Handlebars.registerHelper("camelCase", (str) => {
  return str.charAt(0).toLowerCase() + str.slice(1);
});

Handlebars.registerHelper("pascalCase", (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
});

Handlebars.registerHelper("upperCase", (str) => {
  return str.toUpperCase();
});

// API generator configuration
const config = {
  outputDir: process.env.API_DIR || "src/api",
  framework: "express" // Can be extended to support fastify, koa, etc.
};

// Template definitions
const templates = {
  // Express route handler
  expressRoute: `import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { validateRequest } from '@/middleware/validation';
import { {{pascalCase name}}Service } from '@/services/{{kebabCase name}}.service';
import { ApiError } from '@/utils/ApiError';

const router = Router();
const {{camelCase name}}Service = new {{pascalCase name}}Service();

// Validation schemas
const {{pascalCase name}}Schema = z.object({
  id: z.string().uuid(),
  // Add your fields here
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const Create{{pascalCase name}}Schema = {{pascalCase name}}Schema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

const Update{{pascalCase name}}Schema = Create{{pascalCase name}}Schema.partial();

const QueryParamsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'name']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * @route GET /api/{{kebabCase name}}
 * @desc Get all {{name}} with pagination
 * @access Public
 */
router.get(
  '/',
  validateRequest({ query: QueryParamsSchema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit, search, sortBy, sortOrder } = req.query as z.infer<typeof QueryParamsSchema>;
      
      const result = await {{camelCase name}}Service.findAll({
        page,
        limit,
        search,
        sortBy,
        sortOrder,
      });

      res.json({
        success: true,
        data: result.data,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/{{kebabCase name}}/:id
 * @desc Get {{name}} by ID
 * @access Public
 */
router.get(
  '/:id',
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {{camelCase name}} = await {{camelCase name}}Service.findById(id);

      if (!{{camelCase name}}) {
        throw new ApiError('{{pascalCase name}} not found', 404);
      }

      res.json({
        success: true,
        data: {{camelCase name}},
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/{{kebabCase name}}
 * @desc Create new {{name}}
 * @access Private
 */
router.post(
  '/',
  validateRequest({ body: Create{{pascalCase name}}Schema }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {{camelCase name}} = await {{camelCase name}}Service.create(req.body);

      res.status(201).json({
        success: true,
        data: {{camelCase name}},
        message: '{{pascalCase name}} created successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route PATCH /api/{{kebabCase name}}/:id
 * @desc Update {{name}}
 * @access Private
 */
router.patch(
  '/:id',
  validateRequest({
    params: z.object({ id: z.string().uuid() }),
    body: Update{{pascalCase name}}Schema,
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const {{camelCase name}} = await {{camelCase name}}Service.update(id, req.body);

      if (!{{camelCase name}}) {
        throw new ApiError('{{pascalCase name}} not found', 404);
      }

      res.json({
        success: true,
        data: {{camelCase name}},
        message: '{{pascalCase name}} updated successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/{{kebabCase name}}/:id
 * @desc Delete {{name}}
 * @access Private
 */
router.delete(
  '/:id',
  validateRequest({ params: z.object({ id: z.string().uuid() }) }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const deleted = await {{camelCase name}}Service.delete(id);

      if (!deleted) {
        throw new ApiError('{{pascalCase name}} not found', 404);
      }

      res.json({
        success: true,
        message: '{{pascalCase name}} deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;`,

  // Service layer
  service: `import { PrismaClient } from '@prisma/client';
import { ApiError } from '@/utils/ApiError';
import { 
  Create{{pascalCase name}}Dto, 
  Update{{pascalCase name}}Dto,
  {{pascalCase name}}QueryParams,
  PaginatedResult 
} from '@/types/{{kebabCase name}}.types';

const prisma = new PrismaClient();

export class {{pascalCase name}}Service {
  async findAll(params: {{pascalCase name}}QueryParams): Promise<PaginatedResult<{{pascalCase name}}>> {
    const { page, limit, search, sortBy, sortOrder } = params;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.{{camelCase name}}.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.{{camelCase name}}.count({ where }),
    ]);

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string) {
    return prisma.{{camelCase name}}.findUnique({
      where: { id },
    });
  }

  async create(data: Create{{pascalCase name}}Dto) {
    return prisma.{{camelCase name}}.create({
      data,
    });
  }

  async update(id: string, data: Update{{pascalCase name}}Dto) {
    try {
      return await prisma.{{camelCase name}}.update({
        where: { id },
        data,
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        return null;
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await prisma.{{camelCase name}}.delete({
        where: { id },
      });
      return true;
    } catch (error: any) {
      if (error.code === 'P2025') {
        return false;
      }
      throw error;
    }
  }
}`,

  // Type definitions
  types: `// {{pascalCase name}} type definitions

export interface {{pascalCase name}} {
  id: string;
  // Add your fields here
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Create{{pascalCase name}}Dto {
  name: string;
  description?: string;
}

export interface Update{{pascalCase name}}Dto {
  name?: string;
  description?: string;
}

export interface {{pascalCase name}}QueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy: 'createdAt' | 'updatedAt' | 'name';
  sortOrder: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}`,

  // API tests
  test: `import request from 'supertest';
import { app } from '@/app';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

describe('{{pascalCase name}} API', () => {
  let test{{pascalCase name}}Id: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.{{camelCase name}}.deleteMany({
      where: { name: { startsWith: 'Test' } },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.{{camelCase name}}.deleteMany({
      where: { name: { startsWith: 'Test' } },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/{{kebabCase name}}', () => {
    it('should create a new {{name}}', async () => {
      const newData = {
        name: 'Test {{pascalCase name}}',
        description: 'Test description',
      };

      const response = await request(app)
        .post('/api/{{kebabCase name}}')
        .send(newData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject(newData);
      expect(response.body.data.id).toBeDefined();

      test{{pascalCase name}}Id = response.body.data.id;
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/{{kebabCase name}}')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/{{kebabCase name}}', () => {
    it('should return paginated {{name}} list', async () => {
      const response = await request(app)
        .get('/api/{{kebabCase name}}')
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
      });
    });

    it('should filter by search query', async () => {
      const response = await request(app)
        .get('/api/{{kebabCase name}}')
        .query({ search: 'Test' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].name).toContain('Test');
    });
  });

  describe('GET /api/{{kebabCase name}}/:id', () => {
    it('should return a single {{name}}', async () => {
      const response = await request(app)
        .get(\`/api/{{kebabCase name}}/\${test{{pascalCase name}}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(test{{pascalCase name}}Id);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .get(\`/api/{{kebabCase name}}/\${fakeId}\`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });

    it('should validate UUID format', async () => {
      const response = await request(app)
        .get('/api/{{kebabCase name}}/invalid-uuid')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/{{kebabCase name}}/:id', () => {
    it('should update {{name}}', async () => {
      const updateData = {
        name: 'Test {{pascalCase name}} Updated',
      };

      const response = await request(app)
        .patch(\`/api/{{kebabCase name}}/\${test{{pascalCase name}}Id}\`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .patch(\`/api/{{kebabCase name}}/\${fakeId}\`)
        .send({ name: 'Update' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/{{kebabCase name}}/:id', () => {
    it('should delete {{name}}', async () => {
      const response = await request(app)
        .delete(\`/api/{{kebabCase name}}/\${test{{pascalCase name}}Id}\`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deleted successfully');

      // Verify deletion
      const getResponse = await request(app)
        .get(\`/api/{{kebabCase name}}/\${test{{pascalCase name}}Id}\`)
        .expect(404);
    });

    it('should return 404 for non-existent id', async () => {
      const fakeId = uuidv4();
      const response = await request(app)
        .delete(\`/api/{{kebabCase name}}/\${fakeId}\`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});`,

  // OpenAPI schema
  openapi: `# {{pascalCase name}} API Documentation

## Endpoints

### GET /api/{{kebabCase name}}
Get paginated list of {{name}}

**Query Parameters:**
- \`page\` (number, default: 1) - Page number
- \`limit\` (number, default: 20, max: 100) - Items per page
- \`search\` (string, optional) - Search term
- \`sortBy\` (string, default: 'createdAt') - Sort field
- \`sortOrder\` (string, default: 'desc') - Sort direction

**Response:**
\`\`\`json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
\`\`\`

### GET /api/{{kebabCase name}}/:id
Get {{name}} by ID

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
\`\`\`

### POST /api/{{kebabCase name}}
Create new {{name}}

**Request Body:**
\`\`\`json
{
  "name": "string (required)",
  "description": "string (optional)"
}
\`\`\`

**Response (201):**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "{{pascalCase name}} created successfully"
}
\`\`\`

### PATCH /api/{{kebabCase name}}/:id
Update {{name}}

**Request Body:**
\`\`\`json
{
  "name": "string (optional)",
  "description": "string (optional)"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "{{pascalCase name}} updated successfully"
}
\`\`\`

### DELETE /api/{{kebabCase name}}/:id
Delete {{name}}

**Response:**
\`\`\`json
{
  "success": true,
  "message": "{{pascalCase name}} deleted successfully"
}
\`\`\`

## Error Responses

### 400 Bad Request
\`\`\`json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "Required"
    }
  ]
}
\`\`\`

### 404 Not Found
\`\`\`json
{
  "success": false,
  "message": "{{pascalCase name}} not found"
}
\`\`\`

### 500 Internal Server Error
\`\`\`json
{
  "success": false,
  "message": "Internal server error"
}
\`\`\``
};

// Generate API files
async function generateApi(name, options) {
  logger.info(chalk.blue(`\n🚀 Generating API endpoint: ${name}\n`));

  // Create API directory
  const apiDir = path.join(config.outputDir, name.toLowerCase());

  try {
    await fs.mkdir(apiDir, { recursive: true });
  } catch (error) {
    logger.error(chalk.red(`❌ Failed to create directory: ${error.message}`));
    process.exit(1);
  }

  // Context for templates
  const context = { name };

  // Files to generate
  const files = [
  {
    name: `${name.toLowerCase()}.route.ts`,
    template: templates.expressRoute
  },
  { name: `${name.toLowerCase()}.test.ts`, template: templates.test },
  { name: `${name.toLowerCase()}.types.ts`, template: templates.types },
  { name: "README.md", template: templates.openapi }];


  // Add service file if not using existing service
  if (!options.existingService) {
    files.push({
      name: `${name.toLowerCase()}.service.ts`,
      template: templates.service
    });
  }

  // Generate each file
  for (const file of files) {
    const filePath = path.join(apiDir, file.name);

    // Skip if file exists and not forcing
    if (!options.force) {
      try {
        await fs.access(filePath);
        logger.info(chalk.yellow(`⚠️  Skipping ${file.name} (already exists)`));
        continue;
      } catch {}
    }

    // Compile and write template
    const compiledTemplate = Handlebars.compile(file.template);
    const content = compiledTemplate(context);

    try {
      await fs.writeFile(filePath, content);
      logger.info(chalk.green(`✅ Created ${file.name}`));
    } catch (error) {
      logger.error(
        chalk.red(`❌ Failed to create ${file.name}: ${error.message}`));

    }
  }

  // Success message
  logger.info(
    chalk.green(`\n✨ API endpoint ${name} generated successfully!\n`));

  logger.info(chalk.cyan("📁 Files created:"));
  logger.info(chalk.gray(`   ${apiDir}/`));
  files.forEach((file) => {
    logger.info(chalk.gray(`   ├── ${file.name}`));
  });

  logger.info(chalk.cyan("\n🎯 Next steps:"));
  logger.info(
    chalk.gray(
      `   1. Register route: app.use('/api/${name.toLowerCase()}', ${name.toLowerCase()}Router);`
    ));

  logger.info(chalk.gray(`   2. Create database schema/model`));
  logger.info(chalk.gray(`   3. Implement service methods`));
  logger.info(chalk.gray(`   4. Run tests: npm test ${name.toLowerCase()}`));
  logger.info(chalk.gray(`   5. Update API documentation`));
}

// CLI setup
program.
name("generate-api").
description(
  "Generate a RESTful API endpoint with TypeScript, validation, and tests"
).
argument("<name>", "Resource name (e.g., User, Product)").
option("-f, --force", "Overwrite existing files").
option("-d, --dir <dir>", "Output directory", config.outputDir).
option("--existing-service", "Use existing service layer").
option(
  "--framework <framework>",
  "API framework (express, fastify, koa)",
  "express"
).
action(async (name, options) => {
  if (options.dir) {
    config.outputDir = options.dir;
  }
  if (options.framework) {
    config.framework = options.framework;
  }
  await generateApi(name, options);
});

// Parse CLI arguments
program.parse(process.argv);

// Show help if no arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
}