import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './App.css';

// Import Shadcn UI components
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Separator } from './components/ui/separator';
import { Progress } from './components/ui/progress';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Checkbox } from './components/ui/checkbox';

// Icons from lucide-react
import { 
  GraduationCap, 
  Brain, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Award, 
  BookOpen,
  Target,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Star,
  Send,
  User,
  Mail,
  Lock,
  LogOut
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Set axios default header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Landing Page Component
const LandingPage = () => {
  const [showAuth, setShowAuth] = useState(false);
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Analysis",
      description: "Advanced machine learning algorithms analyze your academic performance, interests, and goals to provide personalized recommendations."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Tailored for India",
      description: "Comprehensive database of Indian careers, education systems, and job market insights specifically designed for Indian students."
    },
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Intelligent Chatbot",
      description: "24/7 AI career counselor ready to answer your questions and guide you through your career journey."
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Future-Ready Careers",
      description: "Stay ahead with insights into emerging fields like Data Science, AI/ML, Digital Marketing, and more."
    }
  ];

  const testimonials = [
    {
      name: "Priya Sharma",
      class: "Class 12 Science Student",
      text: "This platform helped me realize that Data Science was perfect for my skills in mathematics and programming. Now I'm confidently pursuing B.Tech in Computer Science!"
    },
    {
      name: "Rahul Patel",
      class: "B.Com Graduate",
      text: "I was confused between CA and CS. The AI analysis showed me that Chartered Accountancy aligned better with my analytical skills and career goals."
    },
    {
      name: "Ananya Singh",
      class: "Class 10 Student",
      text: "The career guidance helped me choose the right stream. I'm now in Commerce and excited about pursuing economics honors!"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareerGenie
              </span>
            </div>
            <Button 
              onClick={() => setShowAuth(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
              data-testid="get-started-btn"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover Your Perfect
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}Career Path
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              AI-powered career guidance platform designed specifically for Indian students. 
              From Class 9 to undergraduate level, get personalized recommendations that align 
              with your skills, interests, and the Indian job market.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => setShowAuth(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                data-testid="hero-cta-btn"
              >
                Start Your Journey <Sparkles className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 text-lg"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose CareerGenie?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of career guidance with our cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="text-blue-600">{feature.icon}</div>
                  </div>
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              See how CareerGenie has transformed students' futures
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.text}"</p>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.class}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Discover Your Future?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have found their perfect career path with CareerGenie
          </p>
          <Button 
            size="lg"
            onClick={() => setShowAuth(true)}
            className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 text-lg"
            data-testid="cta-signup-btn"
          >
            Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
        />
      )}
    </div>
  );
};

// Auth Modal Component
const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      const response = await axios.post(`${API}${endpoint}`, payload);
      
      login(response.data.user, response.data.access_token);
      onClose();
    } catch (error) {
      console.error('Auth error:', error);
      alert(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">
            {isLogin ? 'Welcome Back' : 'Join CareerGenie'}
          </CardTitle>
          <CardDescription>
            {isLogin ? 'Sign in to continue your journey' : 'Start your career discovery today'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="pl-10"
                    required={!isLogin}
                    data-testid="auth-name-input"
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="pl-10"
                  required
                  data-testid="auth-email-input"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="pl-10"
                  required
                  data-testid="auth-password-input"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700" 
              disabled={isLoading}
              data-testid="auth-submit-btn"
            >
              {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>
          </form>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:underline text-sm"
              data-testid="auth-toggle-btn"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>

          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full"
            data-testid="auth-close-btn"
          >
            Close
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('assessment');
  const [profile, setProfile] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchChatHistory();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API}/profile`);
      setProfile(response.data);
    } catch (error) {
      console.log('No profile found yet');
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`${API}/chat/history`);
      setChatMessages(response.data.reverse());
    } catch (error) {
      console.log('No chat history found');
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim()) return;

    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/chat`, {
        message: chatInput
      });
      
      const newMessage = {
        message: chatInput,
        response: response.data.response,
        timestamp: new Date().toISOString()
      };
      
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CareerGenie</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-700">Welcome, {user.name}!</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={logout}
                data-testid="logout-btn"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assessment" data-testid="assessment-tab">
              <Target className="w-4 h-4 mr-2" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="recommendations" data-testid="recommendations-tab">
              <Award className="w-4 h-4 mr-2" />
              Recommendations
            </TabsTrigger>
            <TabsTrigger value="chat" data-testid="chat-tab">
              <MessageCircle className="w-4 h-4 mr-2" />
              AI Counselor
            </TabsTrigger>
          </TabsList>

          <TabsContent value="assessment" className="space-y-6">
            <AssessmentForm onProfileUpdate={setProfile} />
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <RecommendationsView profile={profile} />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ChatInterface 
              messages={chatMessages}
              input={chatInput}
              setInput={setChatInput}
              onSend={sendChatMessage}
              isLoading={isLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Assessment Form Component
const AssessmentForm = ({ onProfileUpdate }) => {
  const [formData, setFormData] = useState({
    academic_level: '',
    current_class: '',
    stream: '',
    subjects: [],
    grades: {},
    interests: [],
    strengths: [],
    career_goals: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await axios.post(`${API}/profile`, {
        ...formData,
        user_id: 'current_user' // This will be handled by auth middleware
      });
      
      onProfileUpdate(formData);
      alert('Profile saved successfully!');
    } catch (error) {
      console.error('Profile save error:', error);
      alert('Failed to save profile');
    } finally {
      setIsLoading(false);
    }
  };

  const interests = [
    'Technology', 'Science', 'Mathematics', 'Arts', 'Sports', 'Music',
    'Writing', 'Business', 'Medicine', 'Engineering', 'Teaching', 'Research'
  ];

  const strengths = [
    'Problem Solving', 'Leadership', 'Communication', 'Creativity', 'Analysis',
    'Teamwork', 'Organization', 'Critical Thinking', 'Innovation', 'Patience'
  ];

  return (
    <Card className="max-w-4xl mx-auto" data-testid="assessment-form">
      <CardHeader>
        <CardTitle className="text-2xl">Career Assessment</CardTitle>
        <CardDescription>
          Help us understand your academic background and interests to provide personalized recommendations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Academic Level */}
          <div className="space-y-2">
            <Label>Academic Level</Label>
            <Select 
              value={formData.academic_level} 
              onValueChange={(value) => setFormData({...formData, academic_level: value})}
            >
              <SelectTrigger data-testid="academic-level-select">
                <SelectValue placeholder="Select your academic level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School (Class 9-12)</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Current Class */}
          {formData.academic_level === 'high_school' && (
            <div className="space-y-2">
              <Label>Current Class</Label>
              <Select 
                value={formData.current_class} 
                onValueChange={(value) => setFormData({...formData, current_class: value})}
              >
                <SelectTrigger data-testid="current-class-select">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class_9">Class 9</SelectItem>
                  <SelectItem value="class_10">Class 10</SelectItem>
                  <SelectItem value="class_11">Class 11</SelectItem>
                  <SelectItem value="class_12">Class 12</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Stream */}
          <div className="space-y-2">
            <Label>Stream/Field</Label>
            <Select 
              value={formData.stream} 
              onValueChange={(value) => setFormData({...formData, stream: value})}
            >
              <SelectTrigger data-testid="stream-select">
                <SelectValue placeholder="Select your stream" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="science">Science</SelectItem>
                <SelectItem value="commerce">Commerce</SelectItem>
                <SelectItem value="arts">Arts/Humanities</SelectItem>
                <SelectItem value="engineering">Engineering</SelectItem>
                <SelectItem value="medical">Medical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>Interests (Select all that apply)</Label>
            <div className="grid grid-cols-3 gap-3">
              {interests.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={interest}
                    checked={formData.interests.includes(interest)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          interests: [...formData.interests, interest]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          interests: formData.interests.filter(i => i !== interest)
                        });
                      }
                    }}
                    data-testid={`interest-${interest.toLowerCase().replace(' ', '-')}`}
                  />
                  <Label htmlFor={interest} className="text-sm">{interest}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-3">
            <Label>Your Strengths (Select all that apply)</Label>
            <div className="grid grid-cols-3 gap-3">
              {strengths.map((strength) => (
                <div key={strength} className="flex items-center space-x-2">
                  <Checkbox
                    id={strength}
                    checked={formData.strengths.includes(strength)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setFormData({
                          ...formData,
                          strengths: [...formData.strengths, strength]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          strengths: formData.strengths.filter(s => s !== strength)
                        });
                      }
                    }}
                    data-testid={`strength-${strength.toLowerCase().replace(' ', '-')}`}
                  />
                  <Label htmlFor={strength} className="text-sm">{strength}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Career Goals */}
          <div className="space-y-2">
            <Label>Career Goals (Optional)</Label>
            <Textarea
              placeholder="Describe your career aspirations or any specific goals you have..."
              value={formData.career_goals}
              onChange={(e) => setFormData({...formData, career_goals: e.target.value})}
              className="min-h-[100px]"
              data-testid="career-goals-textarea"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={isLoading}
            data-testid="save-profile-btn"
          >
            {isLoading ? 'Saving...' : 'Save Profile & Get Recommendations'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

// Recommendations View Component
const RecommendationsView = ({ profile }) => {
  const [recommendations, setRecommendations] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateRecommendations = async () => {
    if (!profile) return;

    setIsLoading(true);
    try {
      // Remove user_id from profile data as it will be handled by backend auth
      const {user_id, updated_at, ...profileData} = profile;
      const response = await axios.post(`${API}/assessment/analyze`, profileData);
      setRecommendations(response.data);
    } catch (error) {
      console.error('Recommendations error:', error);
      alert('Failed to generate recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return (
      <Card className="text-center p-8" data-testid="no-profile-card">
        <CardContent>
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Complete Your Assessment First</h3>
          <p className="text-gray-600 mb-4">
            Please complete your career assessment to get personalized recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6" data-testid="recommendations-view">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-6 h-6 text-blue-600" />
            <span>Your Career Recommendations</span>
          </CardTitle>
          <CardDescription>
            AI-powered career suggestions based on your profile analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!recommendations ? (
            <div className="text-center py-8">
              <Button 
                onClick={generateRecommendations} 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700"
                data-testid="generate-recommendations-btn"
              >
                {isLoading ? 'Analyzing Your Profile...' : 'Generate AI Recommendations'}
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <div className="space-y-4" data-testid="recommendations-list">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">AI Analysis Result</h4>
                <p className="text-blue-800 whitespace-pre-line">{recommendations.analysis}</p>
              </div>
              <Button 
                onClick={generateRecommendations} 
                variant="outline"
                disabled={isLoading}
                data-testid="regenerate-recommendations-btn"
              >
                Regenerate Recommendations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Chat Interface Component
const ChatInterface = ({ messages, input, setInput, onSend, isLoading }) => {
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="space-y-6" data-testid="chat-interface">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            <span>AI Career Counselor</span>
          </CardTitle>
          <CardDescription>
            Ask questions about careers, education paths, or get personalized guidance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto" data-testid="chat-messages">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Start a conversation with your AI career counselor!</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className="space-y-3">
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs lg:max-w-md">
                      {msg.message}
                    </div>
                  </div>
                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 p-3 rounded-lg max-w-xs lg:max-w-md">
                      {msg.response}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Chat Input */}
          <div className="flex space-x-2">
            <Textarea
              placeholder="Ask about career paths, education requirements, or any guidance you need..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[50px] resize-none"
              disabled={isLoading}
              data-testid="chat-input"
            />
            <Button 
              onClick={onSend} 
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="send-chat-btn"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;