"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldDescription, FieldGroup, FieldSeparator, } from "@/components/ui/field"
import { REQUEST } from "@/routes"
import * as types from "@/types"
import { toast } from "sonner"
function validateSignup(values: types.SignupFormValues) {
    const errors: Partial<types.SignupFormValues> = {}
    if (!values.email) errors.email = "Email is required"
    if (!values.password) errors.password = "Password is required"
    if (values.password && values.password.length < 8)
        errors.password = "Password must be at least 8 characters"
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
        setErrors((errro) => ({ ...errro, [key]: undefined }))
        setServerError(null)
    }

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault()
        const v = validateSignup(values)
        if (Object.keys(v).length) return setErrors(v)
        setLoading(true)
        try {
            const data = (await REQUEST("POST", "auth/register/", values)) as types.AuthResponse
            // if backend returns tokens, store them
            if (data.access) localStorage.setItem("access", data.access)
            if (data.refresh) localStorage.setItem("refresh", data.refresh)
            // navigate after successful signup
            router.push("/login")
        } catch (err: any) {
            setServerError(err?.message || "Registration failed")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex h-screen w-full">
            <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
                <form className="w-full max-w-sm space-y-6" onSubmit={handleSubmit}>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Create your account</h1>
                        <p className="text-sm text-muted-foreground">Enter your details below</p>
                    </div>

                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="signup-first_name">First Name</FieldLabel>
                            <Input
                                id="signup-first_name"
                                type="text"
                                required
                                value={values.first_name}
                                onChange={(e) => onChange("first_name", e.target.value)}
                            />
                            {errors.first_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.first_name}</p>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="signup-last_name">Last Name</FieldLabel>
                            <Input
                                id="signup-last_name"
                                type="text"
                                required
                                value={values.last_name}
                                onChange={(e) => onChange("last_name", e.target.value)}
                            />
                            {errors.last_name && (
                                <p className="text-sm text-red-500 mt-1">{errors.last_name}</p>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="signup-username">User Name</FieldLabel>
                            <Input
                                id="signup-username"
                                type="text"
                                required
                                value={values.username}
                                onChange={(e) => onChange("username", e.target.value)}
                            />
                            {errors.username && (
                                <p className="text-sm text-red-500 mt-1">{errors.username}</p>
                            )}
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="signup-email">Email</FieldLabel>
                            <Input
                                id="signup-email"
                                type="email"
                                required
                                value={values.email}
                                onChange={(e) => onChange("email", e.target.value)}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="signup-password">Password</FieldLabel>
                            <Input
                                id="signup-password"
                                type="password"
                                required
                                value={values.password}
                                onChange={(e) => onChange("password", e.target.value)}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500 mt-1">{errors.password}</p>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="signup-confirm">Confirm Password</FieldLabel>
                            <Input
                                id="signup-confirm"
                                type="password"
                                required
                                value={values.password2}
                                onChange={(e) => onChange("password2", e.target.value)}
                            />
                            {errors.password2 && (
                                <p className="text-sm text-red-500 mt-1">{errors.password2}</p>
                            )}
                        </Field>
                    </FieldGroup>

                    {serverError && <p className="text-sm text-red-500">{serverError}</p>}

                    <Button className="w-full" type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Account"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                        Already have an account? <a href="/login">Sign in</a>
                    </p>
                </form>
            </div>

            <div className="hidden md:block md:w-1/2 relative">
                <video autoPlay muted loop className="h-full w-full object-cover">
                    <source src="/videos/login.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            </div>
        </div>
    )
}

