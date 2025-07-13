import type { Meta, StoryObj } from '@storybook/react';
import { TestMigrationComponent } from './TestMigrationComponent';

const meta = {
  title: 'Components/TestMigrationComponent',
  component: TestMigrationComponent,
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
} satisfies Meta<typeof TestMigrationComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Default TestMigrationComponent',
  },
};

export const Clickable: Story = {
  args: {
    children: 'Click me!',
    onClick: () => { /* Handle TestMigrationComponent click */ },
  },
};

export const WithCustomClass: Story = {
  args: {
    children: 'Styled TestMigrationComponent',
    className: 'custom-styling',
  },
};

export const Empty: Story = {
  args: {},
};