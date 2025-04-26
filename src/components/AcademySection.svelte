<script>
  import { onMount } from 'svelte';
  
  let visible = false;
  let coursesVisible = false;
  
  onMount(() => {
    // Add a small delay to trigger the animation after the component is mounted
    setTimeout(() => {
      visible = true;
    }, 300);
  });
  
  function toggleCourses() {
    coursesVisible = !coursesVisible;
  }
  
  // Sample course data - in a real app, this could come from an API
  const courses = [
    {
      title: "Barista Fundamentals",
      description: "Learn the basics of coffee preparation, equipment handling, and customer service.",
      duration: "2 weeks",
      price: "2,500 ETB",
      icon: "☕"
    },
    {
      title: "Latte Art Mastery",
      description: "Transform your cappuccinos and lattes into visual masterpieces with advanced pouring techniques.",
      duration: "1 week",
      price: "1,800 ETB",
      icon: "🎨"
    },
    {
      title: "Coffee Roasting Essentials",
      description: "Understand the science and art of coffee roasting with hands-on experience.",
      duration: "3 weeks",
      price: "3,200 ETB",
      icon: "🔥"
    },
    {
      title: "Cafe Management",
      description: "Master the business aspects of running a successful coffee shop or cafe.",
      duration: "4 weeks",
      price: "4,000 ETB",
      icon: "📊"
    }
  ];
</script>

<section class="bg-coffee-800 text-cream-100 py-12 md:py-16" id="academy">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid md:grid-cols-2 gap-10 items-center">
      <!-- Academy Info -->
      <div class="transform transition-all duration-700 {visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}">
        <div class="inline-block bg-cream-600 text-coffee-900 font-bold py-1 px-4 rounded-lg mb-4">
          <span class="text-sm">PROFESSIONAL TRAINING</span>
        </div>
        
        <h2 class="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-6">Yoya Coffee Academy</h2>
        
        <p class="text-cream-200 text-lg mb-8 leading-relaxed">
          Elevate your coffee knowledge and skills with our professional training programs. 
          Whether you're an aspiring barista or a coffee enthusiast, our academy offers hands-on 
          courses taught by industry experts in a state-of-the-art facility.
        </p>
        
        <div class="space-y-4 mb-8">
          <div class="flex items-center">
            <div class="w-8 h-8 bg-cream-600 rounded-full flex items-center justify-center text-coffee-900 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span>Expert trainers with international certification</span>
          </div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 bg-cream-600 rounded-full flex items-center justify-center text-coffee-900 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span>Hands-on training with professional equipment</span>
          </div>
          
          <div class="flex items-center">
            <div class="w-8 h-8 bg-cream-600 rounded-full flex items-center justify-center text-coffee-900 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
            <span>Job placement assistance for top performers</span>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4">
          <button 
            on:click={toggleCourses}
            class="bg-cream-600 hover:bg-cream-500 text-coffee-900 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
          >
            <span>View Our Courses</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-2 transition-transform duration-300 {coursesVisible ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          
          <a 
            href="#contact" 
            class="border-2 border-cream-300 hover:border-cream-200 text-cream-100 px-6 py-3 rounded-lg font-medium hover:bg-coffee-700 transform transition-all duration-300 hover:-translate-y-0.5 flex items-center justify-center"
          >
            <span>Contact Us</span>
          </a>
        </div>
      </div>
      
      <!-- Academy Image with Animation -->
      <div class="relative transform transition-all duration-700 delay-300 {visible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}">
        <div class="relative w-full h-80 md:h-96 overflow-hidden rounded-xl shadow-xl">
          <img 
            src="https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&auto=format&q=80" 
            alt="Barista training at Yoya Coffee Academy" 
            class="w-full h-full object-cover"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-coffee-900 via-transparent to-transparent"></div>
          
          <!-- Stats overlay -->
          <div class="absolute bottom-6 left-6 right-6 flex justify-between">
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold">500+</div>
              <div class="text-xs text-cream-300">Graduates</div>
            </div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold">12</div>
              <div class="text-xs text-cream-300">Courses</div>
            </div>
            <div class="text-center">
              <div class="text-2xl md:text-3xl font-bold">95%</div>
              <div class="text-xs text-cream-300">Job Placement</div>
            </div>
          </div>
        </div>
        
        <!-- Floating certification badge -->
        <div class="absolute -top-5 -right-5 bg-coffee-600 text-cream-100 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg border-4 border-coffee-800 animate-pulse-slow">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd" />
          </svg>
          <span class="text-xs font-bold">CERTIFIED</span>
        </div>
      </div>
    </div>
    
    <!-- Courses section - animated accordion -->
    {#if coursesVisible}
      <div class="mt-12 transition-all duration-500 animate-fade-in">
        <h3 class="text-2xl font-bold mb-6">Our Courses</h3>
        
        <div class="grid md:grid-cols-2 gap-6">
          {#each courses as course, i}
            <div class="bg-coffee-700 rounded-xl p-6 hover:bg-coffee-600 transition-colors duration-300 transform hover:scale-102 transition-transform animate-slide-up" style="animation-delay: {i * 150}ms">
              <div class="flex items-start">
                <div class="flex-shrink-0 w-12 h-12 bg-cream-600 text-coffee-900 rounded-full flex items-center justify-center text-xl mr-4">
                  <span>{course.icon}</span>
                </div>
                <div>
                  <h4 class="text-xl font-bold mb-2">{course.title}</h4>
                  <p class="text-cream-300 mb-4">{course.description}</p>
                  <div class="flex flex-wrap gap-4">
                    <div class="bg-coffee-800 rounded-full px-3 py-1 text-xs">
                      <span class="text-cream-300">Duration:</span> {course.duration}
                    </div>
                    <div class="bg-coffee-800 rounded-full px-3 py-1 text-xs">
                      <span class="text-cream-300">Fee:</span> {course.price}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
        
        <div class="mt-8 text-center">
          <a href="#" class="inline-block bg-cream-600 hover:bg-cream-500 text-coffee-900 px-6 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transform transition-all duration-300 hover:-translate-y-0.5">
            Enroll Now
          </a>
        </div>
      </div>
    {/if}
  </div>
</section>

<style>
  .animate-pulse-slow {
    animation: pulse 3s infinite;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
  
  .animate-slide-up {
    opacity: 0;
    transform: translateY(20px);
    animation: slideUp 0.5s ease-out forwards;
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .scale-102 {
    scale: 1.02;
  }
</style>