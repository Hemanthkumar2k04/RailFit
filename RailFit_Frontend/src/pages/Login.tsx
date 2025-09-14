import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext'
import Logo from '@/components/logo'
export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        // Basic validation
        if (!email || !password) {
            setError('Please fill in all fields')
            setIsLoading(false)
            return
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address')
            setIsLoading(false)
            return
        }

        try {
            const success = await login(email, password)

            if (success) {
                navigate('/dashboard')
            } else {
                setError('Invalid email or password')
            }
        } catch (err) {
            setError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/20 p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mb-4 justify-center flex">
                        <Logo />
                    </div>
                    <CardTitle className="text-2xl">Railway Inspector Login</CardTitle>
                    <p className="text-muted-foreground">Access RailFIT Asset Management System</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin}>
                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="w-full"
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-2 rounded border">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Signing In...' : 'Sign In'}
                            </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        <p className="font-medium mb-2">Demo Accounts:</p>
                        <div className="space-y-1 text-xs">
                            <p><strong>Admin:</strong> admin@railway.gov.in</p>
                            <p><strong>Manager:</strong> manager@railway.gov.in</p>
                            <p><strong>Inspector:</strong> inspector@railway.gov.in</p>
                            <p className="mt-2"><strong>Password:</strong> railway123</p>
                        </div>
                    </div>

                    <div className="mt-4 text-center text-sm">
                        <span className="text-muted-foreground">Don't have an account? </span>
                        <Link to="/register" className="text-primary hover:underline">
                            Register here
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}