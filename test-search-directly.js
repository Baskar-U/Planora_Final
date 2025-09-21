// Direct Search Test - Test search functionality directly
console.log('🔍 Testing Search Functionality Directly...');

if (typeof window !== 'undefined') {
  console.log('✅ Window available');
  
  // Test 1: Direct URL navigation
  window.testDirectSearch = () => {
    console.log('🔍 Testing direct URL navigation...');
    
    // Navigate directly to search URL
    const searchUrl = '/?search=Catering';
    console.log('🔗 Navigating to:', searchUrl);
    
    // Use wouter's setLocation if available
    if (window.setLocation) {
      window.setLocation(searchUrl);
    } else {
      // Fallback to window.location
      window.location.href = searchUrl;
    }
  };
  
  // Test 2: Force component re-render
  window.forceSearchRender = () => {
    console.log('🔍 Forcing search component render...');
    
    // Set URL parameters
    const url = new URL(window.location);
    url.searchParams.set('search', 'Catering');
    window.history.pushState({}, '', url);
    
    // Force a popstate event
    window.dispatchEvent(new PopStateEvent('popstate'));
    
    // Force React to re-render by updating a state
    if (window.forceUpdate) {
      window.forceUpdate();
    }
    
    console.log('✅ Forced search render - check if SearchResults component appears');
  };
  
  // Test 3: Check current state
  window.checkCurrentState = () => {
    console.log('🔍 Checking current application state...');
    
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const city = urlParams.get('city');
    
    console.log('📊 Current URL:', window.location.href);
    console.log('📊 URL Parameters:', { search, city });
    
    // Check if SearchResults component is rendered
    const searchResultsElements = document.querySelectorAll('section');
    const hasSearchResults = Array.from(searchResultsElements).some(section => 
      section.textContent?.toLowerCase().includes('search results')
    );
    
    console.log('📊 SearchResults component rendered:', hasSearchResults);
    console.log('📊 Total sections found:', searchResultsElements.length);
    
    // Check for specific search-related text
    const bodyText = document.body.innerText.toLowerCase();
    const hasCateringResults = bodyText.includes('catering') && bodyText.includes('vendor');
    const hasFoundText = bodyText.includes('found') && bodyText.includes('vendor');
    
    console.log('📊 Has catering results:', hasCateringResults);
    console.log('📊 Has "found vendors" text:', hasFoundText);
    
    return {
      url: window.location.href,
      params: { search, city },
      hasSearchResults,
      hasCateringResults,
      hasFoundText
    };
  };
  
  // Test 4: Navigate to vendors page with search
  window.navigateToVendorsWithSearch = () => {
    console.log('🔍 Navigating to vendors page with search...');
    
    // Navigate to vendors page with search parameters
    const vendorsUrl = '/vendors?category=Catering';
    console.log('🔗 Navigating to:', vendorsUrl);
    
    if (window.setLocation) {
      window.setLocation(vendorsUrl);
    } else {
      window.location.href = vendorsUrl;
    }
  };
  
  // Test 5: Complete search test
  window.runCompleteSearchTest = () => {
    console.log('🚀 Running complete search test...');
    
    // Step 1: Check current state
    const currentState = window.checkCurrentState();
    console.log('📊 Current state:', currentState);
    
    // Step 2: Try direct search
    if (!currentState.hasSearchResults) {
      console.log('🔄 Trying direct search...');
      window.testDirectSearch();
      
      // Wait a moment and check again
      setTimeout(() => {
        const newState = window.checkCurrentState();
        console.log('📊 State after direct search:', newState);
        
        if (!newState.hasSearchResults) {
          console.log('🔄 Trying force render...');
          window.forceSearchRender();
        }
      }, 1000);
    } else {
      console.log('✅ Search results already showing!');
    }
  };
  
  console.log('🚀 Direct search test functions available:');
  console.log('- window.testDirectSearch() - Navigate directly to search URL');
  console.log('- window.forceSearchRender() - Force component re-render');
  console.log('- window.checkCurrentState() - Check current state');
  console.log('- window.navigateToVendorsWithSearch() - Go to vendors page with search');
  console.log('- window.runCompleteSearchTest() - Run complete test');
  
  // Auto-run current state check
  console.log('🔍 Auto-checking current state...');
  window.checkCurrentState();
  
} else {
  console.log('❌ Window not available');
}

