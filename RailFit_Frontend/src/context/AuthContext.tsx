import React, { createContext, useContext, useState, useEffect } from 'react'
import { API_ENDPOINTS } from '@/config/api'

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
    canAccessPage: (page: string) => boolean
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

    // Role-based page access control
    const canAccessPage = (page: string): boolean => {
        if (!user) return false
        
        // Inspectors cannot access assets, analytics, or alerts
        if (user.role === 'field_inspector') {
            const restrictedPages = ['assets', 'analytics', 'alerts']
            return !restrictedPages.includes(page)
        }
        
        // Admins and managers can access all pages
        return true
    }

    useEffect(() => {
        // Check if user is authenticated on app load
        const authStatus = localStorage.getItem('isAuthenticated')
        const userData = localStorage.getItem('user')
        const jwtToken = localStorage.getItem('jwt_token')

        if (authStatus === 'true' && userData && jwtToken) {
            try {
                const parsedUser = JSON.parse(userData)
                // TODO: Validate JWT token with backend if needed
                setUser(parsedUser)
                setIsAuthenticated(true)
            } catch (error) {
                console.error('Error parsing user data:', error)
                localStorage.removeItem('isAuthenticated')
                localStorage.removeItem('user')
                localStorage.removeItem('jwt_token')
            }
        }

        setIsLoading(false)
    }, [])

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })

            if (!response.ok) {
                console.error('Login failed:', response.statusText)
                return false
            }

            const data = await response.json()
            
            if (data.access_token && data.user) {
                const authenticatedUser: User = {
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.role,
                    name: data.user.name || data.user.email,
                    department: data.user.department
                }

                setUser(authenticatedUser)
                setIsAuthenticated(true)
                localStorage.setItem('isAuthenticated', 'true')
                localStorage.setItem('user', JSON.stringify(authenticatedUser))
                localStorage.setItem('jwt_token', data.access_token)
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
            const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            })

            if (!response.ok) {
                const errorData = await response.json()
                console.error('Registration failed:', errorData)
                return false
            }

            const data = await response.json()
            
            // Store JWT token and user data
            localStorage.setItem('jwt_token', data.access_token)
            localStorage.setItem('isAuthenticated', 'true')
            localStorage.setItem('user', JSON.stringify(data.user))

            const newUser: User = {
                id: data.user.user_id,
                email: data.user.email,
                role: data.user.role,
                name: data.user.name,
                department: userData.department
            }

            setUser(newUser)
            setIsAuthenticated(true)

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
        localStorage.removeItem('jwt_token')
    }

    const handleLogout = logout // Alias for compatibility

    const value: AuthContextType = {
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
        handleLogout,
        canAccessPage
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}