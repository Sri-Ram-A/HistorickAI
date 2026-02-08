"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldSeparator, } from "@/components/ui/field"
import { REQUEST } from "@/routes"
import * as types from "@/types"


function validateLogin(values: types.LoginFormValues) {
  const errors: Partial<types.LoginFormValues> = {}
  if (!values.username) errors.username = "Username is required"
  if (!values.password) errors.password = "Password is required"
  return errors
}

export default function LoginPage() {
  const router = useRouter()
  const [values, setValues] = useState<types.LoginFormValues>({ username: "", password: "" })
  const [errors, setErrors] = useState<Partial<types.LoginFormValues>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const onChange = (k: keyof types.LoginFormValues, v: string) => {
    setValues((s) => ({ ...s, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setServerError(null)
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    const v = validateLogin(values)
    if (Object.keys(v).length) return setErrors(v)

    setLoading(true)
    try {
      const data = (await REQUEST("POST", "auth/login/", {
        username: values.username,
        password: values.password,
      })) as types.AuthResponse

      // store tokens
      if (data.access) localStorage.setItem("access", data.access)
      if (data.refresh) localStorage.setItem("refresh", data.refresh)
      localStorage.setItem("username", values.username)
      router.push("/home")
    } catch (err: any) {
      setServerError(err?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex w-full md:w-1/2 flex-col p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <span className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              HI
            </span>
            Historick AI
          </a>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="flex flex-col items-center gap-1 text-center">
                  <h1 className="text-2xl font-bold">Login to your account</h1>
                  <p className="text-muted-foreground text-sm">Enter your username below to login to your account</p>
                </div>

                <Field>
                  <FieldLabel htmlFor="login-username">Username</FieldLabel>
                  <Input
                    id="login-username"
                    type="username"
                    placeholder="m@example.com"
                    required
                    value={values.username}
                    onChange={(e) => onChange("username", e.target.value)}
                  />
                  {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
                </Field>

                <Field>
                  <div className="flex items-center">
                    <FieldLabel htmlFor="login-password">Password</FieldLabel>
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">Forgot your password?</a>
                  </div>
                  <Input
                    id="login-password"
                    type="password"
                    required
                    value={values.password}
                    onChange={(e) => onChange("password", e.target.value)}
                  />
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </Field>

                {serverError && <p className="text-sm text-red-500">{serverError}</p>}

                <Field>
                  <Button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
                </Field>

                <FieldSeparator>Or continue with</FieldSeparator>

                <Field>
                  <Button variant="outline" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 mr-2">
                      <path
                        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                        fill="currentColor"
                      />
                    </svg>
                    Login with GitHub
                  </Button>

                  <FieldDescription className="text-center">
                    Don&apos;t have an account? <a href="/register" className="underline underline-offset-4">Sign up</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </div>
        </div>
      </div>

      <div className="hidden md:block md:w-2/3 relative">
        <video autoPlay muted loop playsInline className="absolute inset-0 h-full w-full object-cover">
          <source src="/videos/login.mp4" type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-black/40" />
      </div>
    </div>
  )
}
