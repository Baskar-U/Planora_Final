// Debug Search Flow - Test the exact search functionality
console.log('🔍 Debugging Search Flow...');

if (typeof window !== 'undefined' && window.db && window.collection && window.getDocs) {
  console.log('✅ Firebase functions available');
  
  // Test the exact search logic used by SearchResults component
  window.testSearchLogic = async () => {
    try {
      console.log('🔍 Testing exact search logic from SearchResults component...');
      
      // 1. Get vendors exactly like useVendors hook does
      const querySnapshot = await window.getDocs(window.collection(window.db, "postorder"));
      const allVendors = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('📊 Total vendors fetched:', allVendors.length);
      console.log('🔍 First few vendors:', allVendors.slice(0, 3));
      
      // 2. Test search parameters exactly like SearchResults component
      const searchParams = {
        search: "Catering",
        city: undefined
      };
      
      console.log('🔍 Search params:', searchParams);
      
      // 3. Apply the exact filtering logic from SearchResults component
      const filteredVendors = allVendors.filter((vendor) => {
        const matchesSearch = !searchParams.search || 
          vendor.eventname?.toLowerCase().includes(searchParams.search.toLowerCase()) ||
          vendor.description?.toLowerCase().includes(searchParams.search.toLowerCase()) ||
          vendor.menu?.some((item) => 
            item.toLowerCase().includes(searchParams.search.toLowerCase())
          );

        const matchesCity = !searchParams.city || 
          vendor.location?.toLowerCase().includes(searchParams.city.toLowerCase());

        const matches = matchesSearch && matchesCity;
        
        // Debug each vendor
        if (searchParams.search) {
          const eventNameMatch = vendor.eventname?.toLowerCase().includes(searchParams.search.toLowerCase());
          const descriptionMatch = vendor.description?.toLowerCase().includes(searchParams.search.toLowerCase());
          const menuMatch = vendor.menu?.some((item) => item.toLowerCase().includes(searchParams.search.toLowerCase()));
          
          if (eventNameMatch || descriptionMatch || menuMatch) {
            console.log(`✅ MATCH - Vendor ${vendor.id}:`, {
              businessname: vendor.businessname,
              eventname: vendor.eventname,
              category: vendor.category,
              eventNameMatch,
              descriptionMatch,
              menuMatch,
              finalMatch: matches
            });
          }
        }

        return matches;
      });
      
      console.log('🎯 Filtered vendors count:', filteredVendors.length);
      console.log('✅ Filtered vendors:', filteredVendors);
      
      // 4. Test different search terms
      const testTerms = ['catering', 'Catering', 'CATERING', 'food', 'wedding'];
      
      for (const term of testTerms) {
        const testFiltered = allVendors.filter((vendor) => {
          return vendor.eventname?.toLowerCase().includes(term.toLowerCase()) ||
                 vendor.description?.toLowerCase().includes(term.toLowerCase()) ||
                 vendor.category?.toLowerCase().includes(term.toLowerCase()) ||
                 vendor.menu?.some((item) => item.toLowerCase().includes(term.toLowerCase()));
        });
        
        console.log(`🔍 "${term}" matches:`, testFiltered.length);
      }
      
      return {
        totalVendors: allVendors.length,
        searchTerm: searchParams.search,
        filteredCount: filteredVendors.length,
        filteredVendors: filteredVendors,
        allVendors: allVendors.slice(0, 5)
      };
      
    } catch (error) {
      console.error('❌ Error testing search logic:', error);
      throw error;
    }
  };
  
  // Test the search URL and navigation
  window.testSearchNavigation = () => {
    console.log('🔍 Testing search navigation...');
    
    // Simulate the search button click
    const searchQuery = "Catering";
    const selectedCity = "";
    
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCity) params.set("city", selectedCity);
    
    const searchUrl = `/?${params.toString()}`;
    console.log('🔗 Search URL that should be created:', searchUrl);
    console.log('🔗 Current URL:', window.location.href);
    
    // Test URL parsing
    const urlParams = new URLSearchParams(window.location.search);
    const search = urlParams.get('search');
    const city = urlParams.get('city');
    
    console.log('🔍 Current URL params:', { search, city });
    
    return {
      expectedUrl: searchUrl,
      currentUrl: window.location.href,
      currentParams: { search, city }
    };
  };
  
  // Check if SearchResults component is being rendered
  window.checkSearchResultsComponent = () => {
    console.log('🔍 Checking if SearchResults component is rendered...');
    
    // Look for search results elements
    const searchResultsSection = document.querySelector('[data-testid="search-results"], .search-results, section');
    const searchHeaders = document.querySelectorAll('h1, h2, h3');
    
    console.log('🔍 Found sections:', document.querySelectorAll('section').length);
    console.log('🔍 Found headers:', Array.from(searchHeaders).map(h => h.textContent));
    
    // Check for specific search-related text
    const bodyText = document.body.innerText.toLowerCase();
    const hasSearchResults = bodyText.includes('search results');
    const hasFoundVendors = bodyText.includes('found') && bodyText.includes('vendor');
    const hasNoResults = bodyText.includes('no vendors found');
    
    console.log('🔍 Page analysis:', {
      hasSearchResults,
      hasFoundVendors,
      hasNoResults,
      bodyTextSnippet: bodyText.substring(0, 200) + '...'
    });
    
    return {
      searchResultsSection: !!searchResultsSection,
      hasSearchResults,
      hasFoundVendors,
      hasNoResults
    };
  };
  
  // Complete search flow test
  window.testCompleteSearchFlow = async () => {
    try {
      console.log('🚀 Testing complete search flow...');
      
      // 1. Test navigation
      const navigation = window.testSearchNavigation();
      console.log('📊 Navigation test:', navigation);
      
      // 2. Test search logic
      const searchLogic = await window.testSearchLogic();
      console.log('📊 Search logic test:', searchLogic);
      
      // 3. Check component rendering
      const componentCheck = window.checkSearchResultsComponent();
      console.log('📊 Component check:', componentCheck);
      
      // 4. Provide diagnosis
      console.log('🔍 DIAGNOSIS:');
      
      if (searchLogic.filteredCount > 0) {
        console.log('✅ Search logic works - found vendors!');
        if (!componentCheck.hasSearchResults) {
          console.log('❌ Issue: SearchResults component not rendering');
          console.log('💡 Check if Home.tsx is showing SearchResults when hasSearchParams is true');
        } else if (componentCheck.hasNoResults) {
          console.log('❌ Issue: SearchResults showing "no results" despite finding vendors');
          console.log('💡 Check SearchResults component filtering logic');
        } else {
          console.log('✅ Everything should be working! Check the UI.');
        }
      } else {
        console.log('❌ Search logic not finding vendors');
        console.log('💡 Check the filtering logic in SearchResults component');
      }
      
      return {
        navigation,
        searchLogic,
        componentCheck,
        diagnosis: searchLogic.filteredCount > 0 ? 'Logic works' : 'Logic broken'
      };
      
    } catch (error) {
      console.error('❌ Complete search flow test failed:', error);
      throw error;
    }
  };
  
  console.log('🚀 Search flow debug functions available:');
  console.log('- window.testSearchLogic() - Test exact filtering logic');
  console.log('- window.testSearchNavigation() - Test URL navigation');
  console.log('- window.checkSearchResultsComponent() - Check component rendering');
  console.log('- window.testCompleteSearchFlow() - Run complete test');
  
  // Auto-run the complete test
  console.log('🔍 Auto-running complete search flow test...');
  window.testCompleteSearchFlow().then(result => {
    console.log('📊 Complete search flow test result:', result);
  }).catch(error => {
    console.error('❌ Search flow test failed:', error);
  });
  
} else {
  console.log('❌ Firebase functions not available. Please refresh the page and try again.');
}
