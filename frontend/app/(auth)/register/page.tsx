"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
} from "@/components/ui/field"
import { REQUEST } from "@/routes"
import * as types from "@/types"

function validateSignup(values: types.SignupFormValues) {
  const errors: Partial<types.SignupFormValues> = {}
  if (!values.email) errors.email = "Email is required"
  if (!values.password) errors.password = "Password is required"
  if (values.password && values.password.length < 8)
    errors.password = "Minimum 8 characters required"
  if (values.password !== values.password2)
    errors.password2 = "Passwords do not match"
  return errors
}

export default function SignupFormClient() {
  const router = useRouter()
  const [values, setValues] = useState<types.SignupFormValues>({
    email: "",
    password: "",
    password2: "",
    first_name: "",
    last_name: "",
    username: "",
  })
  const [errors, setErrors] = useState<Partial<types.SignupFormValues>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const onChange = (key: keyof types.SignupFormValues, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setErrors((err) => ({ ...err, [key]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = validateSignup(values)
    if (Object.keys(v).length) return setErrors(v)

    setLoading(true)
    try {
      const data = (await REQUEST("POST", "auth/register/", values)) as types.AuthResponse
      if (data.access) localStorage.setItem("access", data.access)
      if (data.refresh) localStorage.setItem("refresh", data.refresh)
      router.push("/login")
    } catch (err: any) {
      setServerError(err?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full">

      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <img src="/backgrounds/register.png" alt="Background" className="object-cover w-full h-full" />
      </div>

      {/* Foreground */}
      <div className="flex w-full items-center justify-center p-8">

        {/* Foreground shadow + Form*/}
        <div className="w-full max-w-md bg-background/50 backdrop-blur-sm p-6 rounded-xl shadow-lg">

        {/* HistorickAI */}
        <div className="inline-flex bg-white text p-1 rounded gap-2 justify-start mb-2">
          <a href="#" className="flex items-center gap-2 font-medium">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              HI
            </span>
            Historick AI
          </a>
        </div>
          {/* Form */}
          <form className="w-full max-w-md space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-semibold tracking-tight">
                Create your account
              </h1>
              <p className="text-sm text-muted-foreground">
                Get started with Historick AI. It only takes a minute.
              </p>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <Input
                  value={values.first_name}
                  onChange={(e) => onChange("first_name", e.target.value)}
                  placeholder="John"
                />
              </Field>

              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <Input
                  value={values.last_name}
                  onChange={(e) => onChange("last_name", e.target.value)}
                  placeholder="Doe"
                />
              </Field>

              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  value={values.username}
                  onChange={(e) => onChange("username", e.target.value)}
                  placeholder="johndoe"
                />
                <FieldDescription>
                  This will be your public identity.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>

              <Field>
                <FieldLabel>Password</FieldLabel>
                <Input
                  type="password"
                  value={values.password}
                  onChange={(e) => onChange("password", e.target.value)}
                />
                <FieldDescription>
                  Minimum 8 characters required.
                </FieldDescription>
                {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              </Field>

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  type="password"
                  value={values.password2}
                  onChange={(e) => onChange("password2", e.target.value)}
                />
                {errors.password2 && <p className="text-sm text-red-500">{errors.password2}</p>}
              </Field>
            </FieldGroup>

            {serverError && <p className="text-sm text-red-500">{serverError}</p>}

            <Button className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <a href="/login" className="underline">
                Sign in
              </a>
            </p>
          </form>
        </div>

      </div>

    </div>
  )
}