import type { Meta, StoryObj } from '@storybook/react';
import { TestButton } from './TestButton';

const meta = {
  title: 'Components/TestButton',
  component: TestButton,
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
} satisfies Meta<typeof TestButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default TestButton',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    onClick: () => { /* Handle TestButton click */ },
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled TestButton',
    className: 'custom-styling',
  },
};

export const Empty: Story = {
  args: {},
};