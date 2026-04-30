import { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
import type { Space, Supplier } from './types'
import './App.css'

const HomePage = lazy(() => import('./pages/HomePage'))
const ListingPage = lazy(() => import('./pages/ListingPage'))
const DetailPage = lazy(() => import('./pages/DetailPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const HostDashboard = lazy(() => import('./pages/HostDashboard'))
const SpaceFormPage = lazy(() => import('./pages/SpaceFormPage'))
const MyQuotesPage = lazy(() => import('./pages/MyQuotesPage'))
const HostQuotesPage = lazy(() => import('./pages/HostQuotesPage'))
const HowItWorksPage = lazy(() => import('./pages/HowItWorksPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ComparisonPage = lazy(() => import('./pages/ComparisonPage'))
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'))
const SupplierDetailPage = lazy(() => import('./pages/SupplierDetailPage'))
const SupplierFormPage = lazy(() => import('./pages/SupplierFormPage'))
const SupplierDashboard = lazy(() => import('./pages/SupplierDashboard'))
const SupplierLoginPage = lazy(() => import('./pages/SupplierLoginPage'))
const SupplierSignupPage = lazy(() => import('./pages/SupplierSignupPage'))
