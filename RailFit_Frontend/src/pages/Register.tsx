import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/context/AuthContext'

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'field_inspector' as 'admin' | 'manager' | 'field_inspector',
        department: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const { register } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError('Please fill in all required fields')
            setIsLoading(false)
            return
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            setIsLoading(false)
            return
        }

        try {
            const success = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
                department: formData.department || undefined
            })

            if (success) {
                navigate('/dashboard')
            } else {
                setError('Registration failed. Please try again.')
            }
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const roleOptions = [
        { value: 'field_inspector', label: 'Field Inspector', description: 'Conduct inspections and submit reports' },
        { value: 'manager', label: 'Railway Manager', description: 'Manage operations and view analytics' },
        { value: 'admin', label: 'System Administrator', description: 'Full system access and user management' }
    ]

    return (
        <div className="min-h-screen flex items-center justify-center bg-rail-light p-6">
            <Card className="w-full max-w-lg">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-primary">Join RailFIT</CardTitle>
                    <p className="text-muted-foreground">Create your railway management account</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                type="text"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="password"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                disabled={isLoading}
                                required
                            />
                        </div>

                        <div>
                            <Input
                                type="text"
                                placeholder="Department (Optional)"
                                value={formData.department}
                                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                                disabled={isLoading}
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">Select Your Role:</label>
                            {roleOptions.map((role) => (
                                <div
                                    key={role.value}
                                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${formData.role === role.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => setFormData(prev => ({ ...prev, role: role.value as any }))}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="font-medium">{role.label}</div>
                                            <div className="text-sm text-muted-foreground">{role.description}</div>
                                        </div>
                                        {formData.role === role.value && (
                                            <Badge variant="default" className="bg-primary">Selected</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {error && (
                            <div className="text-danger bg-red-50 p-2 rounded border text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">Already have an account? </span>
                        <Link to="/login" className="text-primary hover:underline">
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}