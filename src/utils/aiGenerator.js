// Simulated AI Roadmap Generator

const levelMultipliers = {
  beginner: 1,
  intermediate: 0.7,
  advanced: 0.5,
};

const topicTemplates = {
  'frontend developer': [
    { category: 'HTML', topics: ['HTML Basics & Semantic Tags', 'HTML Forms & Validation', 'HTML5 APIs & Features'] },
    { category: 'CSS', topics: ['CSS Fundamentals & Selectors', 'CSS Flexbox Layout', 'CSS Grid System', 'CSS Animations & Transitions', 'Responsive Design & Media Queries'] },
    { category: 'JavaScript', topics: ['JavaScript Basics & Syntax', 'DOM Manipulation', 'ES6+ Features', 'Async JavaScript & Promises', 'Fetch API & AJAX'] },
    { category: 'React', topics: ['React Fundamentals', 'Components & Props', 'State & Hooks', 'React Router', 'Context API & State Management'] },
    { category: 'Tools', topics: ['Git & GitHub', 'NPM & Package Management', 'Webpack/Vite', 'Browser DevTools'] },
    { category: 'Projects', topics: ['Portfolio Website', 'Todo App with React', 'E-commerce Product Page', 'Weather Dashboard', 'Final Capstone Project'] },
  ],
  'backend developer': [
    { category: 'Programming', topics: ['Programming Fundamentals', 'OOP Concepts', 'Data Structures', 'Algorithms Basics'] },
    { category: 'Node.js', topics: ['Node.js Basics', 'Express.js Framework', 'RESTful API Design', 'Middleware & Error Handling'] },
    { category: 'Databases', topics: ['SQL Fundamentals', 'MongoDB Basics', 'Database Design', 'ORMs & Query Builders'] },
    { category: 'Authentication', topics: ['JWT & Sessions', 'OAuth & Social Login', 'Security Best Practices'] },
    { category: 'Advanced', topics: ['GraphQL Basics', 'WebSockets & Real-time', 'Caching Strategies', 'API Testing'] },
    { category: 'Deployment', topics: ['Docker Basics', 'CI/CD Pipelines', 'Cloud Deployment', 'Monitoring & Logging'] },
  ],
  'data science': [
    { category: 'Python', topics: ['Python Fundamentals', 'NumPy & Arrays', 'Pandas DataFrames', 'Data Cleaning Techniques'] },
    { category: 'Visualization', topics: ['Matplotlib Basics', 'Seaborn & Advanced Plots', 'Interactive Dashboards'] },
    { category: 'Statistics', topics: ['Descriptive Statistics', 'Probability Theory', 'Hypothesis Testing', 'Correlation & Regression'] },
    { category: 'ML Basics', topics: ['Machine Learning Fundamentals', 'Supervised Learning', 'Unsupervised Learning', 'Model Evaluation'] },
    { category: 'Tools', topics: ['Jupyter Notebooks', 'Scikit-learn', 'SQL for Data Analysis'] },
    { category: 'Projects', topics: ['EDA Project', 'Prediction Model', 'Classification Task', 'Final ML Project'] },
  ],
  'mobile developer': [
    { category: 'Basics', topics: ['Mobile Development Overview', 'UI/UX Principles', 'App Architecture'] },
    { category: 'React Native', topics: ['React Native Basics', 'Components & Styling', 'Navigation', 'State Management'] },
    { category: 'Native Features', topics: ['Camera & Media', 'Geolocation', 'Push Notifications', 'Local Storage'] },
    { category: 'API Integration', topics: ['REST API Calls', 'Authentication', 'Data Synchronization'] },
    { category: 'Advanced', topics: ['Performance Optimization', 'Testing', 'App Deployment'] },
    { category: 'Projects', topics: ['Todo Mobile App', 'Weather App', 'Social Media Clone', 'Final Project'] },
  ],
  'devops': [
    { category: 'Linux', topics: ['Linux Fundamentals', 'Shell Scripting', 'System Administration'] },
    { category: 'Networking', topics: ['Networking Basics', 'DNS & Load Balancing', 'Security Fundamentals'] },
    { category: 'Containers', topics: ['Docker Basics', 'Docker Compose', 'Container Orchestration'] },
    { category: 'CI/CD', topics: ['Git Workflows', 'Jenkins/GitHub Actions', 'Automated Testing', 'Deployment Pipelines'] },
    { category: 'Cloud', topics: ['AWS/Azure Basics', 'Infrastructure as Code', 'Monitoring & Logging'] },
    { category: 'Advanced', topics: ['Kubernetes', 'Terraform', 'Security Best Practices', 'Incident Management'] },
  ],
};

const getTopicsForGoal = (goal) => {
  const lowerGoal = goal.toLowerCase();
  
  for (const [key, value] of Object.entries(topicTemplates)) {
    if (lowerGoal.includes(key.split(' ')[0])) {
      return value;
    }
  }
  
  // Default generic programming topics
  return [
    { category: 'Fundamentals', topics: ['Programming Basics', 'Problem Solving', 'Data Structures', 'Algorithms'] },
    { category: 'Core Concepts', topics: ['OOP Principles', 'Design Patterns', 'Clean Code', 'Testing'] },
    { category: 'Tools', topics: ['Version Control', 'IDEs & Editors', 'Debugging Techniques'] },
    { category: 'Practice', topics: ['Coding Challenges', 'Mini Projects', 'Code Reviews'] },
    { category: 'Advanced', topics: ['System Design', 'Performance', 'Security', 'Best Practices'] },
    { category: 'Projects', topics: ['Portfolio Projects', 'Open Source', 'Capstone Project'] },
  ];
};

const generateRoadmap = (formData) => {
  const { goal, currentLevel, timePerDay, deadline } = formData;
  
  // Calculate total days available
  const deadlineDate = new Date(deadline);
  const today = new Date();
  const totalDays = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
  
  // Get topic structure based on goal
  const topicStructure = getTopicsForGoal(goal);
  
  // Calculate topics per day based on level
  const multiplier = levelMultipliers[currentLevel] || 1;
  const hoursPerDay = parseFloat(timePerDay) || 2;
  
  // Flatten all topics
  const allTopics = topicStructure.flatMap(cat => 
    cat.topics.map(topic => ({ category: cat.category, topic }))
  );
  
  // Distribute topics across available days
  const roadmap = [];
  let currentDay = 1;
  let topicIndex = 0;
  
  while (currentDay <= totalDays && topicIndex < allTopics.length) {
    const { category, topic } = allTopics[topicIndex];
    
    // Estimate duration based on hours per day
    const duration = `${hoursPerDay} hours`;
    
    roadmap.push({
      day: currentDay,
      topic: `${topic}`,
      category: category,
      status: 'pending',
      duration: duration,
      resources: generateResources(topic),
      description: generateDescription(topic, currentLevel),
    });
    
    topicIndex++;
    currentDay++;
  }
  
  // If we have more days than topics, add practice/project days
  while (currentDay <= totalDays) {
    roadmap.push({
      day: currentDay,
      topic: `Practice & Review Day ${currentDay - allTopics.length}`,
      category: 'Practice',
      status: 'pending',
      duration: `${hoursPerDay} hours`,
      resources: ['Review previous topics', 'Work on projects', 'Practice coding challenges'],
      description: 'Consolidate your learning through practice and hands-on projects.',
    });
    currentDay++;
  }
  
  // If we have more topics than days, distribute them
  if (allTopics.length > totalDays) {
    const adjustedRoadmap = [];
    const topicsPerDay = Math.ceil(allTopics.length / totalDays);
    
    for (let day = 1; day <= totalDays; day++) {
      const dayTopics = allTopics.slice((day - 1) * topicsPerDay, day * topicsPerDay);
      const topicNames = dayTopics.map(t => t.topic).join(' & ');
      
      adjustedRoadmap.push({
        day: day,
        topic: topicNames,
        category: dayTopics[0]?.category || 'Mixed',
        status: 'pending',
        duration: `${hoursPerDay} hours`,
        resources: generateResources(topicNames),
        description: `Focus on: ${topicNames}`,
      });
    }
    
    return adjustedRoadmap.slice(0, totalDays);
  }
  
  return roadmap.slice(0, totalDays);
};

const generateResources = (topic) => {
  return [
    `📺 Video Tutorial: ${topic}`,
    `📖 Read: ${topic} Documentation`,
    `💻 Practice: Build a ${topic} project`,
  ];
};

const generateDescription = (topic, level) => {
  const descriptions = {
    beginner: `Learn the fundamentals of ${topic} from scratch. Perfect for beginners with no prior experience.`,
    intermediate: `Deep dive into ${topic} with practical examples. Build on your existing foundation.`,
    advanced: `Master ${topic} with advanced concepts and best practices. Optimize your skills.`,
  };
  
  return descriptions[level] || descriptions.beginner;
};

export { generateRoadmap };
