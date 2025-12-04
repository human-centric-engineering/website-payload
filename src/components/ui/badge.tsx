import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/utilities/ui'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary/10 text-primary hover:bg-primary/20',
        secondary: 'bg-muted text-muted-foreground hover:bg-muted/80',
        success: 'bg-success/10 text-success hover:bg-success/20',
        warning: 'bg-warning/10 text-warning hover:bg-warning/20',
        error: 'bg-error/10 text-error hover:bg-error/20',
        outline: 'border border-border bg-transparent hover:bg-muted/50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
