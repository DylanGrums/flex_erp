import { useState } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { cn } from '@/lib/utils';
import { DeviceType, Section } from '@/types/editor';
import { ShoppingCart, Search, Menu, ChevronRight, Star, Truck, RefreshCw, Shield, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const deviceWidths: Record<DeviceType, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px',
};

interface MockSectionProps {
  section: Section;
  isSelected: boolean;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: () => void;
}

function MockSection({ section, isSelected, isHovered, onHover, onClick }: MockSectionProps) {
  if (!section.visible) return null;

  const renderContent = () => {
    switch (section.type) {
      case 'announcement-bar':
        return (
          <div 
            className="py-2 px-4 text-center text-sm"
            style={{ 
              backgroundColor: section.settings.backgroundColor as string || '#6366F1',
              color: section.settings.textColor as string || '#FFFFFF'
            }}
          >
            {section.settings.text as string || 'Announcement text'}
          </div>
        );

      case 'header':
        return (
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between max-w-6xl mx-auto">
              <div className="flex items-center gap-8">
                <span className="text-xl font-bold">{section.settings.logoText as string || 'Store'}</span>
                <nav className="hidden md:flex items-center gap-6">
                  {section.blocks.map((block) => (
                    <span key={block.id} className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                      {block.settings.label as string}
                    </span>
                  ))}
                </nav>
              </div>
              <div className="flex items-center gap-4">
                {section.settings.showSearch && <Search className="w-5 h-5 text-gray-600" />}
                {section.settings.showCart && <ShoppingCart className="w-5 h-5 text-gray-600" />}
                <Menu className="w-5 h-5 text-gray-600 md:hidden" />
              </div>
            </div>
          </header>
        );

      case 'hero-banner':
        return (
          <div className="relative bg-gradient-to-br from-indigo-600 to-purple-700 text-white py-24 px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                {section.settings.heading as string || 'Welcome'}
              </h1>
              <p className="text-lg md:text-xl opacity-90 mb-8">
                {section.settings.subheading as string || 'Discover amazing products'}
              </p>
              <button className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
                {section.settings.buttonText as string || 'Shop Now'}
              </button>
            </div>
          </div>
        );

      case 'split-hero':
        const imageRight = section.settings.imagePosition === 'right';
        return (
          <div className={cn('flex flex-col md:flex-row min-h-[400px]', imageRight && 'md:flex-row-reverse')}>
            <div className="flex-1 bg-gray-100" />
            <div className="flex-1 flex items-center justify-center p-8 md:p-12">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold mb-4">{section.settings.heading as string || 'New Collection'}</h2>
                <p className="text-gray-600 mb-6">{section.settings.description as string || 'Explore our latest arrivals'}</p>
                <button className="bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
                  {section.settings.buttonText as string || 'Explore'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'featured-collection':
        return (
          <div className="py-16 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{section.settings.heading as string || 'Featured Products'}</h2>
                {section.settings.showViewAll && (
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: Number(section.settings.productsToShow) || 4 }).map((_, i) => (
                  <div key={i} className="group">
                    <div className="aspect-square bg-gray-100 rounded-lg mb-3 group-hover:bg-gray-200 transition" />
                    <h3 className="font-medium text-sm mb-1">Product Name</h3>
                    <p className="text-sm text-gray-600">$99.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'collection-tabs':
        return (
          <div className="py-16 px-6 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-8">{section.settings.heading as string || 'Shop by Category'}</h2>
              <div className="flex justify-center gap-4 mb-8">
                {section.blocks.map((block, i) => (
                  <button
                    key={block.id}
                    className={cn(
                      'px-4 py-2 rounded-full text-sm font-medium transition',
                      i === 0 ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                    )}
                  >
                    {block.name}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="group">
                    <div className="aspect-square bg-white rounded-lg mb-3 shadow-sm group-hover:shadow-md transition" />
                    <h3 className="font-medium text-sm mb-1">Product {i + 1}</h3>
                    <p className="text-sm text-gray-600">$79.00</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'highlight-cards':
        return (
          <div className="py-16 px-6 bg-white">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-12">{section.settings.heading as string || 'Why Choose Us'}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {(section.blocks.length > 0 ? section.blocks : [
                  { id: '1', name: 'Free Shipping', settings: { icon: 'truck', description: 'On orders over $50' } },
                  { id: '2', name: 'Easy Returns', settings: { icon: 'refresh', description: '30-day return policy' } },
                  { id: '3', name: 'Secure Payment', settings: { icon: 'shield', description: 'Your data is safe' } },
                ]).map((block, i) => {
                  const icons = [Truck, RefreshCw, Shield];
                  const Icon = icons[i % 3];
                  return (
                    <div key={block.id} className="text-center">
                      <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-6 h-6 text-indigo-600" />
                      </div>
                      <h3 className="font-semibold mb-2">{block.name}</h3>
                      <p className="text-sm text-gray-600">{block.settings.description as string}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );

      case 'testimonials':
        return (
          <div className="py-16 px-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-12">{section.settings.heading as string || 'What Our Customers Say'}</h2>
              <div className="bg-white rounded-2xl p-8 shadow-sm">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-lg text-gray-700 mb-6">"This is the best online shopping experience I've ever had. The products are amazing and the service is top-notch!"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <p className="font-medium">Jane Doe</p>
                    <p className="text-sm text-gray-600">Verified Customer</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'newsletter':
        return (
          <div 
            className="py-16 px-6"
            style={{ backgroundColor: section.settings.backgroundColor as string || '#F8FAFC' }}
          >
            <div className="max-w-xl mx-auto text-center">
              <Mail className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">{section.settings.heading as string || 'Stay Updated'}</h2>
              <p className="text-gray-600 mb-6">{section.settings.subheading as string || 'Subscribe to our newsletter'}</p>
              <div className="flex gap-2 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition">
                  {section.settings.buttonText as string || 'Subscribe'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'footer':
        return (
          <footer className="bg-gray-900 text-white py-12 px-6">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Shop All</li>
                    <li>New Arrivals</li>
                    <li>Best Sellers</li>
                    <li>Sale</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Customer Service</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>Contact Us</li>
                    <li>Shipping Info</li>
                    <li>Returns</li>
                    <li>FAQ</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Company</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li>About Us</li>
                    <li>Careers</li>
                    <li>Press</li>
                    <li>Blog</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Follow Us</h3>
                  {section.settings.showSocialLinks && (
                    <div className="flex gap-4">
                      <Facebook className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                      <Twitter className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                      <Instagram className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                {section.settings.copyrightText as string || '© 2026 Your Store. All rights reserved.'}
              </div>
            </div>
          </footer>
        );

      default:
        return (
          <div className="py-12 px-6 bg-gray-100 text-center text-gray-500">
            Unknown section type: {section.type}
          </div>
        );
    }
  };

  return (
    <div
      className={cn(
        'relative transition-all',
        (isSelected || isHovered) && 'ring-2 ring-inset',
        isSelected ? 'ring-primary' : isHovered ? 'ring-primary/50 ring-dashed' : ''
      )}
      onMouseEnter={() => onHover(section.id)}
      onMouseLeave={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      {(isSelected || isHovered) && (
        <div className={cn(
          'absolute top-2 left-2 z-10 px-2 py-1 text-xs font-medium rounded',
          isSelected ? 'bg-primary text-primary-foreground' : 'bg-primary/80 text-primary-foreground'
        )}>
          {section.name}
        </div>
      )}
      {renderContent()}
    </div>
  );
}

export function PreviewCanvas() {
  const { state, selectSection } = useEditor();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex-1 bg-canvas-bg overflow-auto p-6">
      <div
        className="mx-auto transition-all duration-300 ease-out bg-canvas-frame shadow-lg rounded-lg overflow-hidden"
        style={{
          width: deviceWidths[state.device],
          maxWidth: '100%',
          minHeight: 'calc(100vh - 200px)',
        }}
      >
        <div className="min-h-full">
          {state.sections.length === 0 ? (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">No sections yet</p>
                <p className="text-sm">Add sections from the left panel to start building your page</p>
              </div>
            </div>
          ) : (
            state.sections.map((section) => (
              <MockSection
                key={section.id}
                section={section}
                isSelected={state.selectedSectionId === section.id}
                isHovered={hoveredId === section.id}
                onHover={setHoveredId}
                onClick={() => selectSection(section.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
