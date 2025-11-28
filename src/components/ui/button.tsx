import { cn } from '@/utilities/ui'
import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    defaultVariants: {
      size: 'default',
      variant: 'default',
    },
    variants: {
      size: {
        clear: '',
        default: 'h-11 px-6 py-2.5',
        icon: 'h-11 w-11',
        lg: 'h-14 px-8 text-base',
        sm: 'h-9 px-4 text-xs',
      },
      variant: {
        default: 'bg-gradient-orange text-primary-foreground hover:opacity-90 hover:shadow-lg hover:shadow-primary/25',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        ghost: 'hover:bg-card/50 hover:text-accent-foreground',
        link: 'text-primary items-start justify-start underline-offset-4 hover:underline hover:text-primary/80',
        outline: 'border-2 border-primary/50 bg-transparent text-foreground hover:bg-primary/10 hover:border-primary',
        secondary: 'bg-card border border-border text-foreground hover:bg-card/80 hover:border-border/80',
      },
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  ref?: React.Ref<HTMLButtonElement>
}

const Button: React.FC<ButtonProps> = ({
  asChild = false,
  className,
  size,
  variant,
  ref,
  ...props
}) => {
  const Comp = asChild ? Slot : 'button'
  return <Comp className={cn(buttonVariants({ className, size, variant }))} ref={ref} {...props} />
}

export { Button, buttonVariants }
