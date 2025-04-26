export interface Bookmark {
    id: string;
    username: string;
    handle: string;
    avatar: string;
    content: string;
    date: string;
    likes: number;
    retweets: number;
    replies: number;
    views: number;
    images?: string[];
    folders?: string[];
    isVerified?: boolean;
  }
  
  export const folders = [
    { id: '1', name: 'Favorites' },
    { id: '2', name: 'Read Later' },
    { id: '3', name: 'Tech News' },
    { id: '4', name: 'Inspiration' },
    { id: '5', name: 'Tutorials' },
  ];
  
  export const filters = [
    { id: '1', name: 'Media' },
    { id: '2', name: 'Links' },
    { id: '3', name: 'Mentions' },
    { id: '4', name: 'Verified' },
  ];
  
  export const bookmarks: Bookmark[] = [
    {
      id: '1',
      username: 'Elon Musk',
      handle: '@elonmusk',
      avatar: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=100&auto=format&fit=crop',
      content: "Just had a great conversation with the team about the future of sustainable energy. Exciting times ahead!",
      date: '2h',
      likes: 45200,
      retweets: 5600,
      replies: 2300,
      views: 1200000,
      folders: ['1'],
      isVerified: true,
    },
    {
      id: '2',
      username: 'React Native',
      handle: '@reactnative',
      avatar: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?q=80&w=100&auto=format&fit=crop',
      content: "React Native 0.72 is out! Check out the new features and improvements.",
      date: '1d',
      likes: 3200,
      retweets: 890,
      replies: 145,
      views: 98000,
      folders: ['3', '5'],
      isVerified: true,
    },
    {
      id: '3',
      username: 'Sarah Johnson',
      handle: '@sarahj',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
      content: "Just published my new article on UX design principles for mobile apps. Would love your feedback!",
      date: '2d',
      likes: 1200,
      retweets: 320,
      replies: 78,
      views: 45000,
      images: ['https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=500&auto=format&fit=crop'],
      folders: ['4', '5'],
    },
    {
      id: '4',
      username: 'Tech Insider',
      handle: '@techinsider',
      avatar: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=100&auto=format&fit=crop',
      content: "Breaking: Apple announces new developer tools at WWDC. This is going to change how we build apps forever.",
      date: '3d',
      likes: 5600,
      retweets: 2100,
      replies: 430,
      views: 230000,
      folders: ['2', '3'],
      isVerified: true,
    },
    {
      id: '5',
      username: 'Design Matters',
      handle: '@designmatters',
      avatar: 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?q=80&w=100&auto=format&fit=crop',
      content: "Minimalism isn't about having less. It's about making room for what matters.",
      date: '5d',
      likes: 8900,
      retweets: 3200,
      replies: 210,
      views: 320000,
      images: ['https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=500&auto=format&fit=crop'],
      folders: ['4'],
    },
    {
      id: '6',
      username: 'JavaScript Daily',
      handle: '@javascriptdaily',
      avatar: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?q=80&w=100&auto=format&fit=crop',
      content: "10 JavaScript tricks that will make your code cleaner and more efficient. #JavaScript #WebDev",
      date: '1w',
      likes: 4300,
      retweets: 1800,
      replies: 320,
      views: 180000,
      folders: ['5'],
      isVerified: true,
    },
    {
      id: '7',
      username: 'Product Hunt',
      handle: '@producthunt',
      avatar: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?q=80&w=100&auto=format&fit=crop',
      content: "Introducing the hottest new productivity app that's taking the world by storm. Check it out now!",
      date: '1w',
      likes: 3400,
      retweets: 890,
      replies: 230,
      views: 120000,
      images: ['https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=500&auto=format&fit=crop'],
      folders: ['2', '4'],
      isVerified: true,
    },
    {
      id: '8',
      username: 'Startup Founder',
      handle: '@startupfounder',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
      content: "Raised $5M in seed funding today! So grateful for the amazing team and investors who believe in our vision.",
      date: '2w',
      likes: 12000,
      retweets: 4500,
      replies: 890,
      views: 450000,
      folders: ['1'],
    },
  ];