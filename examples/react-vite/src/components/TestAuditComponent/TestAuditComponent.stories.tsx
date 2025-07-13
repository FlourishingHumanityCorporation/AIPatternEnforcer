import type { Meta, StoryObj } from '@storybook/react';
import { TestAuditComponent } from './TestAuditComponent';

const meta = {
  title: 'Display/TestAuditComponent',
  component: TestAuditComponent,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to display inside the component',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
} satisfies Meta<typeof TestAuditComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Display content',
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled content',
    className: 'custom-styling',
  },
};