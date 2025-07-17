import type { Meta, StoryObj } from "@storybook/react";
import { AIChat } from "./AIChat";

const meta = {
  title: "Interactive/AIChat",
  component: AIChat,
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
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    isLoading: {
      control: "boolean",
      description: "Loading state",
    },
    error: {
      control: "text",
      description: "Error message",
    },
  },
} satisfies Meta<typeof AIChat>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Interactive Content",
  },
};

export const Loading: Story = {
  args: {
    children: "Loading State",
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled State",
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    children: "Error State",
    error: "Something went wrong",
  },
};
