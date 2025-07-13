import type { Meta, StoryObj } from '@storybook/react';
import { TestComponent2 } from './TestComponent2';

const meta = {
  title: 'Components/TestComponent2',
  component: TestComponent2,
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
    onClick: {
      action: 'clicked',
      description: 'Click event handler',
    },
  },
} satisfies Meta<typeof TestComponent2>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default TestComponent2',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    onClick: () => { /* Handle TestComponent2 click */ },
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled TestComponent2',
    className: 'custom-styling',
  },
};

export const Empty: Story = {
  args: {},
};