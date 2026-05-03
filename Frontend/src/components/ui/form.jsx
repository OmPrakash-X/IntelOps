import {
  Controller,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "../../lib/utils"

export const Form = FormProvider

export function FormField({ control, name, render }) {
  return (
    <Controller
      control={control}
      name={name}
      render={render}
    />
  )
}

export function FormItem({ children, className }) {
  return (
    <div className={cn("space-y-2", className)}>
      {children}
    </div>
  )
}

export function FormLabel({ children, className }) {
  return (
    <label className={cn("text-sm text-slate-400", className)}>
      {children}
    </label>
  )
}

export function FormControl({ children }) {
  return <div>{children}</div>
}

export function FormMessage({ name, className }) {
  const {
    formState: { errors },
  } = useFormContext()

  const error = errors?.[name]

  if (!error) return null

  return (
    <p className={cn("text-xs text-red-500", className)}>
      {error?.message}
    </p>
  )
}