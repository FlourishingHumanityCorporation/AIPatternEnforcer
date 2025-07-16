import type { Meta, StoryObj } from "@storybook/react";
import { TestValidation } from "./TestValidation";

const meta = {
  title: "Display/TestValidation",
  component: TestValidation,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    children: {
      control: "text",
      description: "Content to display inside the component",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
} satisfies Meta<typeof TestValidation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Display content",
  },
};

export const WithCustomClass: Story = {
  args: {
    children: "Styled content",
    className: "custom-styling",
  },
};
