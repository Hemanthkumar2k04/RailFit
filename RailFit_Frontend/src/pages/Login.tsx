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

    const demoAccounts = [
        { role: 'Admin', email: 'admin@railfit.com', description: 'System Administrator' },
        { role: 'Manager', email: 'manager@railfit.com', description: 'Operations Manager' },
        { role: 'Inspector', email: 'inspector@railfit.com', description: 'Field Inspector' }
    ]

    const fillDemoCredentials = (email: string) => {
        setEmail(email)
        setPassword('railway123')
    }

    return (
        <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Card className="shadow-xl">
                    {/* Header with Logo */}
                    <CardHeader className="text-center space-y-6">
                        <div className="flex justify-center">
                            <Logo />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-bold">Railway Inspector Login</CardTitle>
                            <p className="text-muted-foreground mt-2">Access RailFIT Asset Management System</p>
                        </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Login Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium">
                                    Email Address
                                </label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>
                            
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium">
                                    Password
                                </label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="h-11"
                                />
                            </div>

                            {error && (
                                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200 flex items-start gap-2">
                                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-11 mt-6"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Signing In...
                                    </div>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Demo Accounts Section */}
                        <div className="space-y-4">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Demo Accounts</span>
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                {demoAccounts.map((account) => (
                                    <button
                                        key={account.email}
                                        onClick={() => fillDemoCredentials(account.email)}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-between p-3 text-left bg-muted/40 hover:bg-muted/60 rounded-md transition-colors border hover:border-muted-foreground/20"
                                    >
                                        <div>
                                            <div className="font-medium text-sm">
                                                {account.role}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {account.description}
                                            </div>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Click to use
                                        </div>
                                    </button>
                                ))}
                            </div>
                            
                            <div className="text-center">
                                <p className="text-xs text-muted-foreground">
                                    Demo password: <span className="font-mono bg-muted px-1 rounded">railway123</span>
                                </p>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center pt-4 border-t">
                            <span className="text-sm text-muted-foreground">Don't have an account? </span>
                            <Link 
                                to="/register" 
                                className="text-sm text-primary hover:underline"
                            >
                                Register here
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}