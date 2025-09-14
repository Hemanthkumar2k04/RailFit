import React, { createContext, useContext, useState, useEffect } from 'react'

// Types for authentication
interface User {
    id: string
    email: string
    role: 'admin' | 'manager' | 'field_inspector'
    name: string
    department?: string
}

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<boolean>
    register: (userData: RegisterData) => Promise<boolean>
    logout: () => void
    handleLogout: () => void
}

interface RegisterData {
    email: string
    password: string
    name: string
    role: 'admin' | 'manager' | 'field_inspector'
    department?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // Check if user is authenticated on app load
        const authStatus = localStorage.getItem('isAuthenticated')
        const userData = localStorage.getItem('user')

        if (authStatus === 'true' && userData) {
            try {
                const parsedUser = JSON.parse(userData)
                setUser(parsedUser)
                setIsAuthenticated(true)
            } catch (error) {
                console.error('Error parsing user data:', error)
                localStorage.removeItem('isAuthenticated')
                localStorage.removeItem('user')
            }
        }

        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            // Mock authentication - replace with real API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            // Demo users for different roles
            const demoUsers: Record<string, User> = {
                'admin@railway.gov.in': {
                    id: '1',
                    email: 'admin@railway.gov.in',
                    role: 'admin',
                    name: 'System Administrator',
                    department: 'IT Operations'
                },
                'manager@railway.gov.in': {
                    id: '2',
                    email: 'manager@railway.gov.in',
                    role: 'manager',
                    name: 'Railway Manager',
                    department: 'Operations'
                },
                'inspector@railway.gov.in': {
                    id: '3',
                    email: 'inspector@railway.gov.in',
                    role: 'field_inspector',
                    name: 'Field Inspector',
                    department: 'Maintenance'
                }
            }

            const authenticatedUser = demoUsers[email]

            if (authenticatedUser && password.length >= 6) {
                setUser(authenticatedUser)
                setIsAuthenticated(true)
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('user', JSON.stringify(authenticatedUser))
                return true
            }

            return false
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            // Mock registration - replace with real API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newUser: User = {
                id: Date.now().toString(),
                email: userData.email,
                role: userData.role,
                name: userData.name,
                department: userData.department
            }

            setUser(newUser)
            setIsAuthenticated(true)
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('user', JSON.stringify(newUser))

            return true
        } catch (error) {
            console.error('Registration error:', error)
            return false
        }
    }

    const logout = () => {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('isAuthenticated')
        localStorage.removeItem('user')
    }

    const handleLogout = logout // Alias for compatibility

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        handleLogout
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}