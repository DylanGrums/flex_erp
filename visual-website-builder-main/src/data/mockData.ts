import { Section, SectionDefinition, Collection, Template } from '@/types/editor';

export const sectionDefinitions: SectionDefinition[] = [
  {
    type: 'header',
    name: 'Header',
    description: 'Site navigation and logo',
    icon: 'layout-template',
    category: 'header',
    defaultSettings: {
      logoText: 'Your Store',
      showSearch: true,
      showCart: true,
    },
    settingsSchema: [
      { key: 'logoText', type: 'text', label: 'Logo Text', group: 'Content' },
      { key: 'showSearch', type: 'toggle', label: 'Show Search', group: 'Content' },
      { key: 'showCart', type: 'toggle', label: 'Show Cart', group: 'Content' },
      { key: 'backgroundColor', type: 'color', label: 'Background Color', group: 'Style' },
      { key: 'textColor', type: 'color', label: 'Text Color', group: 'Style' },
    ],
  },
  {
    type: 'announcement-bar',
    name: 'Announcement Bar',
    description: 'Promotional message banner',
    icon: 'megaphone',
    category: 'header',
    defaultSettings: {
      text: 'Free shipping on orders over $50!',
      backgroundColor: '#6366F1',
      textColor: '#FFFFFF',
    },
    settingsSchema: [
      { key: 'text', type: 'text', label: 'Announcement Text', group: 'Content' },
      { key: 'link', type: 'text', label: 'Link URL', group: 'Content' },
      { key: 'backgroundColor', type: 'color', label: 'Background Color', group: 'Style' },
      { key: 'textColor', type: 'color', label: 'Text Color', group: 'Style' },
    ],
  },
  {
    type: 'hero-banner',
    name: 'Hero Banner',
    description: 'Full-width image with text overlay',
    icon: 'image',
    category: 'hero',
    defaultSettings: {
      heading: 'Welcome to Our Store',
      subheading: 'Discover amazing products at great prices',
      buttonText: 'Shop Now',
      buttonLink: '/collections/all',
      overlayOpacity: 40,
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
      { key: 'subheading', type: 'textarea', label: 'Subheading', group: 'Content' },
      { key: 'buttonText', type: 'text', label: 'Button Text', group: 'Content' },
      { key: 'buttonLink', type: 'text', label: 'Button Link', group: 'Content' },
      { key: 'image', type: 'image', label: 'Background Image', group: 'Content' },
      { key: 'overlayOpacity', type: 'range', label: 'Overlay Opacity', min: 0, max: 100, step: 5, group: 'Style' },
      { key: 'textAlign', type: 'select', label: 'Text Alignment', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ], group: 'Layout' },
    ],
  },
  {
    type: 'split-hero',
    name: 'Split Hero',
    description: 'Image and text side by side',
    icon: 'columns',
    category: 'hero',
    defaultSettings: {
      heading: 'New Collection',
      description: 'Explore our latest arrivals',
      buttonText: 'Explore',
      imagePosition: 'right',
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
      { key: 'description', type: 'textarea', label: 'Description', group: 'Content' },
      { key: 'buttonText', type: 'text', label: 'Button Text', group: 'Content' },
      { key: 'image', type: 'image', label: 'Image', group: 'Content' },
      { key: 'imagePosition', type: 'select', label: 'Image Position', options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ], group: 'Layout' },
    ],
  },
  {
    type: 'featured-collection',
    name: 'Featured Collection',
    description: 'Showcase products from a collection',
    icon: 'grid-3x3',
    category: 'collections',
    defaultSettings: {
      heading: 'Featured Products',
      productsToShow: 4,
      showViewAll: true,
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
      { key: 'collection', type: 'collection', label: 'Collection', group: 'Content' },
      { key: 'productsToShow', type: 'range', label: 'Products to Show', min: 2, max: 8, step: 1, group: 'Layout' },
      { key: 'showViewAll', type: 'toggle', label: 'Show View All Button', group: 'Layout' },
    ],
  },
  {
    type: 'collection-tabs',
    name: 'Collection Tabs',
    description: 'Multiple collections with tabs',
    icon: 'folder-kanban',
    category: 'collections',
    defaultSettings: {
      heading: 'Shop by Category',
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
    ],
  },
  {
    type: 'highlight-cards',
    name: 'Highlight Cards',
    description: 'Feature cards with icons',
    icon: 'credit-card',
    category: 'marketing',
    defaultSettings: {
      heading: 'Why Choose Us',
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
    ],
  },
  {
    type: 'newsletter',
    name: 'Newsletter',
    description: 'Email signup form',
    icon: 'mail',
    category: 'marketing',
    defaultSettings: {
      heading: 'Stay Updated',
      subheading: 'Subscribe to our newsletter for exclusive deals',
      buttonText: 'Subscribe',
      backgroundColor: '#F8FAFC',
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
      { key: 'subheading', type: 'textarea', label: 'Subheading', group: 'Content' },
      { key: 'buttonText', type: 'text', label: 'Button Text', group: 'Content' },
      { key: 'backgroundColor', type: 'color', label: 'Background Color', group: 'Style' },
    ],
  },
  {
    type: 'testimonials',
    name: 'Testimonials',
    description: 'Customer reviews carousel',
    icon: 'quote',
    category: 'marketing',
    defaultSettings: {
      heading: 'What Our Customers Say',
    },
    settingsSchema: [
      { key: 'heading', type: 'text', label: 'Heading', group: 'Content' },
    ],
  },
  {
    type: 'footer',
    name: 'Footer',
    description: 'Site footer with links',
    icon: 'panel-bottom',
    category: 'footer',
    defaultSettings: {
      copyrightText: '© 2026 Your Store. All rights reserved.',
      showSocialLinks: true,
      showPaymentIcons: true,
    },
    settingsSchema: [
      { key: 'copyrightText', type: 'text', label: 'Copyright Text', group: 'Content' },
      { key: 'showSocialLinks', type: 'toggle', label: 'Show Social Links', group: 'Content' },
      { key: 'showPaymentIcons', type: 'toggle', label: 'Show Payment Icons', group: 'Content' },
      { key: 'backgroundColor', type: 'color', label: 'Background Color', group: 'Style' },
    ],
  },
];

export const mockCollections: Collection[] = [
  { id: 'col-1', name: 'Summer Sale', productCount: 24, image: undefined },
  { id: 'col-2', name: 'New Arrivals', productCount: 18, image: undefined },
  { id: 'col-3', name: 'Best Sellers', productCount: 32, image: undefined },
  { id: 'col-4', name: 'Accessories', productCount: 15, image: undefined },
  { id: 'col-5', name: 'Home & Living', productCount: 28, image: undefined },
  { id: 'col-6', name: 'Electronics', productCount: 42, image: undefined },
];

export const classicStorefrontTemplate: Template = {
  id: 'classic',
  name: 'Classic Storefront',
  description: 'A traditional ecommerce layout with a hero banner, featured products, and newsletter signup.',
  sections: [
    {
      id: 'header-1',
      type: 'header',
      name: 'Header',
      icon: 'layout-template',
      visible: true,
      settings: { logoText: 'Your Store', showSearch: true, showCart: true },
      blocks: [
        { id: 'nav-1', type: 'nav-link', name: 'Shop', settings: { label: 'Shop', url: '/collections' } },
        { id: 'nav-2', type: 'nav-link', name: 'About', settings: { label: 'About', url: '/about' } },
        { id: 'nav-3', type: 'nav-link', name: 'Contact', settings: { label: 'Contact', url: '/contact' } },
      ],
    },
    {
      id: 'hero-1',
      type: 'hero-banner',
      name: 'Hero Banner',
      icon: 'image',
      visible: true,
      settings: {
        heading: 'Welcome to Our Store',
        subheading: 'Discover amazing products at great prices',
        buttonText: 'Shop Now',
        buttonLink: '/collections/all',
        overlayOpacity: 40,
        textAlign: 'center',
      },
      blocks: [],
    },
    {
      id: 'featured-1',
      type: 'featured-collection',
      name: 'Featured Collection',
      icon: 'grid-3x3',
      visible: true,
      settings: {
        heading: 'Featured Products',
        productsToShow: 4,
        showViewAll: true,
      },
      blocks: [],
    },
    {
      id: 'newsletter-1',
      type: 'newsletter',
      name: 'Newsletter',
      icon: 'mail',
      visible: true,
      settings: {
        heading: 'Stay Updated',
        subheading: 'Subscribe to our newsletter for exclusive deals',
        buttonText: 'Subscribe',
      },
      blocks: [],
    },
    {
      id: 'footer-1',
      type: 'footer',
      name: 'Footer',
      icon: 'panel-bottom',
      visible: true,
      settings: {
        copyrightText: '© 2026 Your Store. All rights reserved.',
        showSocialLinks: true,
        showPaymentIcons: true,
      },
      blocks: [
        { id: 'footer-col-1', type: 'footer-column', name: 'Quick Links', settings: {} },
        { id: 'footer-col-2', type: 'footer-column', name: 'Customer Service', settings: {} },
      ],
    },
  ],
};

export const modernMinimalTemplate: Template = {
  id: 'modern',
  name: 'Modern Minimal',
  description: 'A sleek, contemporary design with split hero, highlight cards, and tabbed collections.',
  sections: [
    {
      id: 'announcement-1',
      type: 'announcement-bar',
      name: 'Announcement Bar',
      icon: 'megaphone',
      visible: true,
      settings: {
        text: 'Free shipping on orders over $50!',
        backgroundColor: '#6366F1',
        textColor: '#FFFFFF',
      },
      blocks: [],
    },
    {
      id: 'header-2',
      type: 'header',
      name: 'Header',
      icon: 'layout-template',
      visible: true,
      settings: { logoText: 'MINIMAL', showSearch: true, showCart: true },
      blocks: [
        { id: 'nav-4', type: 'nav-link', name: 'Collections', settings: { label: 'Collections', url: '/collections' } },
        { id: 'nav-5', type: 'nav-link', name: 'About', settings: { label: 'About', url: '/about' } },
      ],
    },
    {
      id: 'split-hero-1',
      type: 'split-hero',
      name: 'Split Hero',
      icon: 'columns',
      visible: true,
      settings: {
        heading: 'New Collection',
        description: 'Explore our latest arrivals, crafted with precision and style.',
        buttonText: 'Explore',
        imagePosition: 'right',
      },
      blocks: [],
    },
    {
      id: 'highlights-1',
      type: 'highlight-cards',
      name: 'Highlight Cards',
      icon: 'credit-card',
      visible: true,
      settings: { heading: 'Why Choose Us' },
      blocks: [
        { id: 'highlight-1', type: 'highlight-card', name: 'Free Shipping', settings: { icon: 'truck', title: 'Free Shipping', description: 'On orders over $50' } },
        { id: 'highlight-2', type: 'highlight-card', name: 'Easy Returns', settings: { icon: 'refresh-cw', title: 'Easy Returns', description: '30-day return policy' } },
        { id: 'highlight-3', type: 'highlight-card', name: 'Secure Payment', settings: { icon: 'shield', title: 'Secure Payment', description: 'Your data is safe' } },
      ],
    },
    {
      id: 'tabs-1',
      type: 'collection-tabs',
      name: 'Collection Tabs',
      icon: 'folder-kanban',
      visible: true,
      settings: { heading: 'Shop by Category' },
      blocks: [
        { id: 'tab-1', type: 'collection-tab', name: 'New Arrivals', settings: { collectionId: 'col-2' } },
        { id: 'tab-2', type: 'collection-tab', name: 'Best Sellers', settings: { collectionId: 'col-3' } },
        { id: 'tab-3', type: 'collection-tab', name: 'Sale', settings: { collectionId: 'col-1' } },
      ],
    },
    {
      id: 'footer-2',
      type: 'footer',
      name: 'Footer',
      icon: 'panel-bottom',
      visible: true,
      settings: {
        copyrightText: '© 2026 MINIMAL. All rights reserved.',
        showSocialLinks: true,
        showPaymentIcons: false,
      },
      blocks: [],
    },
  ],
};

export const templates: Template[] = [classicStorefrontTemplate, modernMinimalTemplate];
