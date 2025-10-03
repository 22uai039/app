import requests
import sys
import json
from datetime import datetime

class CareerGuidanceAPITester:
    def __init__(self, base_url="https://skillsift-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test_name": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if not endpoint.startswith('http') else endpoint
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        print(f"   Method: {method}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            print(f"   Response Status: {response.status_code}")
            
            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_detail += f" - {response.json()}"
                except:
                    error_detail += f" - {response.text}"
                self.log_test(name, False, error_detail)
                return False, {}

        except Exception as e:
            error_detail = f"Request failed: {str(e)}"
            self.log_test(name, False, error_detail)
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_career_domains(self):
        """Test career domains endpoint"""
        return self.run_test(
            "Career Domains",
            "GET", 
            "careers/domains",
            200
        )

    def test_user_registration(self):
        """Test user registration"""
        test_user_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   ✅ Token obtained: {self.token[:20]}...")
            return True, response
        
        return success, response

    def test_user_login(self):
        """Test user login with existing credentials"""
        # First register a user
        test_user_data = {
            "name": f"Login Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"login_test_{datetime.now().strftime('%H%M%S')}@example.com",
            "password": "LoginTest123!"
        }
        
        # Register user
        reg_success, reg_response = self.run_test(
            "User Registration for Login Test",
            "POST",
            "auth/register", 
            200,
            data=test_user_data
        )
        
        if not reg_success:
            return False, {}
        
        # Now test login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        return success, response

    def test_profile_creation(self):
        """Test profile creation"""
        if not self.token:
            self.log_test("Profile Creation", False, "No authentication token available")
            return False, {}
        
        profile_data = {
            "user_id": self.user_id,
            "academic_level": "high_school",
            "current_class": "class_12",
            "stream": "science",
            "subjects": ["Physics", "Chemistry", "Mathematics"],
            "grades": {"Physics": "A", "Chemistry": "B+", "Mathematics": "A+"},
            "interests": ["Technology", "Science", "Engineering"],
            "strengths": ["Problem Solving", "Analysis", "Critical Thinking"],
            "career_goals": "I want to become a software engineer and work in AI/ML field"
        }
        
        return self.run_test(
            "Profile Creation",
            "POST",
            "profile",
            200,
            data=profile_data
        )

    def test_profile_retrieval(self):
        """Test profile retrieval"""
        if not self.token:
            self.log_test("Profile Retrieval", False, "No authentication token available")
            return False, {}
        
        return self.run_test(
            "Profile Retrieval",
            "GET",
            "profile",
            200
        )

    def test_career_analysis(self):
        """Test career analysis/recommendations"""
        if not self.token:
            self.log_test("Career Analysis", False, "No authentication token available")
            return False, {}
        
        profile_data = {
            "user_id": self.user_id,
            "academic_level": "high_school",
            "current_class": "class_12", 
            "stream": "science",
            "subjects": ["Physics", "Chemistry", "Mathematics"],
            "grades": {"Physics": "A", "Chemistry": "B+", "Mathematics": "A+"},
            "interests": ["Technology", "Science", "Engineering"],
            "strengths": ["Problem Solving", "Analysis", "Critical Thinking"],
            "career_goals": "I want to become a software engineer"
        }
        
        print("   ⏳ This may take 10-15 seconds for AI analysis...")
        return self.run_test(
            "Career Analysis",
            "POST",
            "assessment/analyze",
            200,
            data=profile_data
        )

    def test_chat_functionality(self):
        """Test AI chat functionality"""
        if not self.token:
            self.log_test("Chat Functionality", False, "No authentication token available")
            return False, {}
        
        chat_data = {
            "message": "What are the best engineering colleges in India for computer science?"
        }
        
        print("   ⏳ This may take 10-15 seconds for AI response...")
        return self.run_test(
            "Chat Functionality",
            "POST",
            "chat",
            200,
            data=chat_data
        )

    def test_chat_history(self):
        """Test chat history retrieval"""
        if not self.token:
            self.log_test("Chat History", False, "No authentication token available")
            return False, {}
        
        return self.run_test(
            "Chat History",
            "GET",
            "chat/history",
            200
        )

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, _ = self.run_test(
            "Unauthorized Profile Access",
            "GET",
            "profile",
            401
        )
        
        # Restore token
        self.token = original_token
        return success, {}

    def run_all_tests(self):
        """Run comprehensive API test suite"""
        print("🚀 Starting Career Guidance API Test Suite")
        print("=" * 60)
        
        # Test public endpoints first
        self.test_root_endpoint()
        self.test_career_domains()
        
        # Test authentication
        self.test_user_registration()
        self.test_user_login()
        
        # Test unauthorized access
        self.test_unauthorized_access()
        
        # Test profile management (requires auth)
        self.test_profile_creation()
        self.test_profile_retrieval()
        
        # Test AI features (requires auth and may take time)
        self.test_career_analysis()
        self.test_chat_functionality()
        self.test_chat_history()
        
        # Print final results
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Return results for further processing
        return {
            "total_tests": self.tests_run,
            "passed_tests": self.tests_passed,
            "failed_tests": self.tests_run - self.tests_passed,
            "success_rate": (self.tests_passed/self.tests_run)*100,
            "test_details": self.test_results
        }

def main():
    """Main test execution"""
    tester = CareerGuidanceAPITester()
    results = tester.run_all_tests()
    
    # Save results to file
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)
    
    # Return appropriate exit code
    return 0 if results["failed_tests"] == 0 else 1

if __name__ == "__main__":
    sys.exit(main())