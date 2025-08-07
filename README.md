# 🌊 Umino Theme

A modern, responsive Shopify theme designed for e-commerce excellence. Built with clean code, performance optimization, and merchant customization in mind.

<p align="center">
  <a href="./LICENSE.md"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
  <a href="./CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/Code%20of%20Conduct-Contributor%20Covenant-blue.svg" alt="Code of Conduct"></a>
</p>

## 🚀 Features

### Core Features
- **Responsive Design**: Mobile-first approach with seamless cross-device experience
- **Performance Optimized**: Fast loading times with optimized assets and lazy loading
- **SEO Friendly**: Semantic HTML structure and meta tag optimization
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Modern UI/UX**: Clean, intuitive interface with smooth animations

### Theme Sections
- **Header**: Sticky navigation with search, cart, and account links
- **Footer**: Comprehensive footer with links, social media, and newsletter signup
- **Hero Sections**: Customizable banner sections with call-to-action buttons
- **Product Grids**: Flexible product display with filtering and sorting options
- **Collection Showcases**: Visual collection displays with spotlight and text layouts
- **Sliders**: Interactive carousel sections for featured content
- **Newsletter**: Email subscription with customizable styling

### Customization Options
- **Color Schemes**: Extensive color customization for all theme elements
- **Typography**: Font family and size controls throughout the theme
- **Layout Options**: Flexible grid systems and spacing controls
- **Block-Based**: Modular content blocks for easy customization
- **Translation Ready**: Full internationalization support

## 📁 Project Structure

```
Umino-theme/
├── assets/                 # Static assets (CSS, JS, images)
│   ├── theme.css          # Main theme stylesheet
│   ├── main.js            # Core JavaScript functionality
│   ├── responsive.css     # Responsive design styles
│   └── [images]/          # Theme images and icons
├── config/                # Theme configuration
│   ├── settings_schema.json    # Theme settings structure
│   └── settings_data.json     # Default theme settings
├── layout/                # Layout templates
│   ├── theme.liquid       # Main layout wrapper
│   └── password.liquid    # Password page layout
├── locales/               # Translation files
│   ├── en.default.json    # English translations
│   └── [other languages]/ # Additional language files
├── sections/              # Theme sections
│   ├── header.liquid      # Site header
│   ├── footer.liquid      # Site footer
│   ├── featured_collection.liquid
│   ├── new_arrivals.liquid
│   ├── slider.liquid      # Carousel section
│   ├── section-group.liquid # Collection links groups
│   └── [other sections]/  # Additional sections
├── snippets/              # Reusable code fragments
│   ├── meta-tags.liquid   # SEO meta tags
│   ├── social-icons.liquid
│   ├── menu-header-icons.liquid
│   ├── menu-footer-icons.liquid
│   ├── chat-scrollup.liquid
│   └── divider.liquid
├── templates/             # Page templates
│   ├── index.json         # Homepage template
│   ├── product.json       # Product page template
│   ├── collection.json    # Collection page template
│   ├── cart.json          # Shopping cart template
│   ├── search.json        # Search results template
│   ├── blog.json          # Blog listing template
│   ├── article.json       # Blog article template
│   ├── page.json          # Static page template
│   ├── 404.json           # 404 error page
│   ├── customers/         # Customer account templates
│   └── [other templates]/ # Additional page templates
└── [configuration files]  # Git, theme check, etc.
```

## 🛠️ Development Setup

### Prerequisites

- [Shopify CLI](https://shopify.dev/docs/api/shopify-cli) - Latest version
- [Node.js](https://nodejs.org/) - Version 16 or higher
- [Git](https://git-scm.com/) - For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repository-url]
   cd Umino-theme
   ```

2. **Install Shopify CLI** (if not already installed)
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```

3. **Login to Shopify**
   ```bash
   shopify auth login
   ```

4. **Connect to your store**
   ```bash
   shopify theme dev --store=your-store.myshopify.com
   ```

### Development Commands

```bash
# Start development server
shopify theme dev

# Push theme to store
shopify theme push

# Pull theme from store
shopify theme pull

# Check theme for issues
shopify theme check

# Deploy to production
shopify theme deploy
```

## 🎨 Customization Guide

### Adding New Sections

1. Create a new `.liquid` file in the `sections/` directory
2. Define the section structure with HTML and Liquid
3. Add a `{% schema %}` block for customization options
4. Include `{% stylesheet %}` and `{% javascript %}` tags for styling and functionality

Example section structure:
```liquid
<div class="my-section">
  <!-- Section content -->
</div>

{% stylesheet %}
.my-section {
  /* Section styles */
}
{% endstylesheet %}

{% schema %}
{
  "name": "My Section",
  "settings": [
    {
      "type": "text",
      "id": "heading",
      "label": "Heading",
      "default": "Section Heading"
    }
  ]
}
{% endschema %}
```

### Creating Blocks

Blocks allow merchants to add, remove, and reorder content within sections:

```liquid
{% for block in section.blocks %}
  {% case block.type %}
    {% when 'text' %}
      <div class="text-block" {{ block.shopify_attributes }}>
        {{ block.settings.content }}
      </div>
    {% when 'image' %}
      <div class="image-block" {{ block.shopify_attributes }}>
        {{ block.settings.image | image_url: width: 400 | image_tag }}
      </div>
  {% endcase %}
{% endfor %}
```

### Styling Guidelines

- Use BEM methodology for CSS class naming
- Implement mobile-first responsive design
- Use CSS variables for theme-wide values
- Keep specificity low (0 1 0 maximum)
- Avoid `!important` declarations

### JavaScript Best Practices

- Use ES6+ syntax
- Implement proper error handling
- Follow module pattern for organization
- Use event delegation where appropriate
- Ensure accessibility compliance

## 🌐 Internationalization

The theme supports multiple languages through the `locales/` directory:

1. **Add new language**: Create `[language-code].json` in `locales/`
2. **Translate content**: Use `{{ 'key' | t }}` in templates
3. **Update schema**: Add translations for section settings

Example translation usage:
```liquid
<h1>{{ 'general.welcome_message' | t }}</h1>
```

## 📱 Responsive Design

The theme implements a mobile-first approach with breakpoints:

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

Key responsive features:
- Flexible grid systems
- Touch-friendly navigation
- Optimized images for different screen sizes
- Collapsible menus for mobile

## ⚡ Performance Optimization

### Asset Optimization
- Minified CSS and JavaScript
- Optimized image formats (WebP support)
- Lazy loading for images
- Critical CSS inlining

### Code Optimization
- Efficient Liquid templating
- Minimal DOM manipulation
- Optimized database queries
- Caching strategies

## 🔧 Configuration

### Theme Settings

Configure theme appearance through `config/settings_schema.json`:

```json
{
  "name": "Colors",
  "settings": [
    {
      "type": "color",
      "id": "primary_color",
      "label": "Primary Color",
      "default": "#007cba"
    }
  ]
}
```

### Section Presets

Create reusable section configurations:

```json
{
  "presets": [
    {
      "name": "Featured Collection",
      "category": "Collections",
      "blocks": {
        "collection": {
          "type": "collection"
        }
      }
    }
  ]
}
```

## 🧪 Testing

### Theme Check
```bash
shopify theme check
```

### Browser Testing
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Test on various devices and screen sizes
- Validate accessibility with screen readers

### Performance Testing
- Use Google PageSpeed Insights
- Test with WebPageTest
- Monitor Core Web Vitals

## 📦 Deployment

### Development to Production

1. **Test thoroughly** in development environment
2. **Run theme check** for any issues
3. **Deploy to staging** store first
4. **Test on staging** store
5. **Deploy to production**:
   ```bash
   shopify theme deploy
   ```

### Version Control

- Use semantic versioning
- Create feature branches for new development
- Write descriptive commit messages
- Tag releases appropriately

## 🤝 Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards

- Follow Shopify's Liquid coding standards
- Use consistent indentation (2 spaces)
- Write clear, documented code
- Include appropriate comments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details.

## 🆘 Support

- **Documentation**: Check this README and Shopify's theme documentation
- **Issues**: Report bugs and feature requests through GitHub issues
- **Community**: Join Shopify's developer community forums

## 🙏 Acknowledgments

- Built with Shopify's theme architecture
- Inspired by modern e-commerce design patterns
- Community contributions and feedback

---

**Made with ❤️ for the Shopify community**
