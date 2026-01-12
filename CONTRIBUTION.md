# Contributing to SSDF

Thank you for your interest in contributing to the Sovereign Spiral Development Framework! We welcome contributions that align with our core principles and maintain the project's focus.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Philosophy & Principles](#philosophy--principles)
- [What We're Looking For](#what-were-looking-for)
- [What We Won't Accept](#what-we-wont-accept)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)
- [Questions?](#questions)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful, considerate, and constructive in all interactions.

### Expected Behavior

- Be respectful of differing viewpoints and experiences
- Give and gracefully accept constructive feedback
- Focus on what is best for the community and project
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or trolling
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

---

## Philosophy & Principles

SSDF is built on these core principles:

1. **MIT Always Applies** - Commercial licenses add rights; they never remove freedoms
2. **Server-Side Authority** - Prices and SKUs validated server-side; client cannot manipulate
3. **Static First** - Frontend is pure HTML/JS; backend only for payments
4. **No Dark Patterns** - Free use never blocked; checkout explicit and reversible
5. **Minimal & Auditable** - Small codebase that can be understood and verified

All contributions must align with these principles.

---

## What We're Looking For

### High Priority

✅ **Bug Fixes**
- Payment processing issues
- Cart persistence bugs
- Email delivery failures
- Webhook handling errors
- Security vulnerabilities

✅ **Security Improvements**
- Better input validation
- Enhanced rate limiting
- Improved error handling
- Dependency security updates

✅ **Documentation**
- Clearer setup instructions
- More examples
- Better error messages
- API documentation improvements
- Translation to other languages

✅ **Accessibility**
- ARIA label improvements
- Keyboard navigation enhancements
- Screen reader compatibility
- Color contrast fixes

✅ **Payment Provider Updates**
- New Stripe API versions
- PayPal API updates
- Additional payment methods (if simple)

### Medium Priority

✅ **Performance Optimizations**
- Faster page loads
- Reduced bundle size (if applicable)
- More efficient API calls
- Better caching strategies

✅ **User Experience**
- Better error messages
- Improved loading states
- Mobile responsiveness fixes
- Form validation improvements

✅ **Testing**
- Unit tests
- Integration tests
- End-to-end tests
- Load testing

---

## What We Won't Accept

❌ **Frontend Frameworks**
- React, Vue, Angular, Svelte, etc.
- We maintain vanilla JavaScript for auditability

❌ **Build Tools** (unless absolutely necessary)
- Webpack, Vite, Parcel
- Keep static and simple

❌ **License Enforcement / DRM**
- Anything that blocks free MIT usage
- Phone-home mechanisms
- License verification servers

❌ **Tracking / Analytics** (unless privacy-preserving)
- Google Analytics
- Facebook Pixel
- Any third-party tracking

❌ **Blockchain / Cryptocurrency**
- NFT licensing
- Crypto payment processing
- Token-based anything

❌ **Feature Bloat**
- Unnecessary complexity
- Features not aligned with core mission
- Anything that makes the codebase harder to audit

---

## How to Contribute

### 1. Check Existing Issues

Before starting work:
- Search [existing issues](https://github.com/yourusername/ssdf/issues)
- Comment on the issue to claim it
- Discuss approach if it's a significant change

### 2. Create an Issue (for new features)

For new features or significant changes:
- Open an issue first
- Describe the problem you're solving
- Propose your solution
- Wait for maintainer approval before coding

### 3. Fork & Branch

```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ssdf.git
cd ssdf

# Create a branch
git checkout -b fix/payment-bug
# or
git checkout -b feature/email-templates
```

### 4. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation as needed

### 5. Test Thoroughly

- Test manually in browser
- Test payment flows with test cards
- Verify webhooks work
- Check mobile responsiveness
- Test error cases

### 6. Commit with Clear Messages

```bash
git commit -m "Fix: Stripe webhook idempotency handling

- Add event ID tracking to prevent duplicate processing
- Use Set for in-memory deduplication (upgrade to Redis for production)
- Fixes #123"
```

Commit message format:
```
Type: Brief description

- Detailed change 1
- Detailed change 2

Fixes #issue_number
```

Types: `Fix`, `Feature`, `Docs`, `Style`, `Refactor`, `Test`, `Chore`

### 7. Push & Create Pull Request

```bash
git push origin fix/payment-bug
```

Then create a Pull Request on GitHub.

---

## Development Setup

### Prerequisites

- Node.js ≥18
- npm ≥8
- Git
- Text editor (VS Code recommended)

### Backend Setup

```bash
cd ssdf-backend
npm install
cp .env.example .env
# Edit .env with your test API keys
npm run dev
```

### Frontend Setup

```bash
cd ssdf-frontend
# Open index.html in browser
# Or use a simple server:
python3 -m http.server 3000
```

### Testing Setup

```bash
# Install Stripe CLI for webhook testing
# Download from: https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:4242/webhook/stripe
```

---

## Coding Standards

### JavaScript Style

- Use modern ES6+ syntax
- Prefer `const` over `let`, avoid `var`
- Use arrow functions for callbacks
- Use template literals for strings
- Use async/await over promises chains

**Good:**
```javascript
const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    throw error;
  }
};
```

**Bad:**
```javascript
var fetchData = function(url) {
  return fetch(url).then(function(response) {
    return response.json();
  }).catch(function(error) {
    console.log(error);
  });
};
```

### HTML Style

- Use semantic HTML5 elements
- Include ARIA labels for accessibility
- Validate with W3C validator
- Keep markup clean and readable

### CSS Style

- Use CSS custom properties (variables)
- Mobile-first responsive design
- Avoid !important
- Use meaningful class names

### Backend Style

- Clear function names
- Comprehensive error handling
- Logging for important events
- Input validation on all endpoints

---

## Testing Requirements

### Before Submitting PR

- [ ] Code works locally
- [ ] No JavaScript console errors
- [ ] Tested in Chrome/Firefox/Safari
- [ ] Mobile responsive (use DevTools)
- [ ] Payment flow works with test cards
- [ ] Webhooks fire correctly
- [ ] Email delivery works (if applicable)
- [ ] Error cases handled gracefully
- [ ] Documentation updated

### Stripe Test Cards

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
```

### PayPal Testing

Use PayPal sandbox accounts.

---

## Pull Request Process

### PR Checklist

- [ ] PR title clearly describes the change
- [ ] Description explains what and why
- [ ] All tests pass
- [ ] Documentation updated
- [ ] No merge conflicts
- [ ] Follows code style guidelines
- [ ] Security implications considered
- [ ] Breaking changes noted (if any)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Security fix

## Testing
How was this tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests pass
- [ ] No new warnings

## Related Issues
Fixes #123
Related to #456
```

### Review Process

1. **Automated Checks** - CI runs (when configured)
2. **Maintainer Review** - Usually within 3-5 days
3. **Feedback & Iteration** - Address review comments
4. **Approval** - Once approved, will be merged
5. **Thanks!** - Your contribution credited in CHANGELOG

### After Merge

- Your PR will be included in the next release
- You'll be added to contributors list
- Changes documented in CHANGELOG

---

## Documentation

### When to Update Docs

Update documentation when you:
- Add new features
- Change existing behavior
- Fix important bugs
- Add/remove dependencies
- Change configuration

### Which Docs to Update

- `README.md` - Overview and quick start
- `DEPLOYMENT_GUIDE.md` - Deployment steps
- `API_DOCUMENTATION.md` - API changes
- `TESTING_GUIDE.md` - New tests
- `CHANGELOG.md` - All changes
- Code comments - Complex logic

---

## Questions?

### Where to Ask

- **General Questions:** [GitHub Discussions](https://github.com/yourusername/ssdf/discussions)
- **Bug Reports:** [GitHub Issues](https://github.com/yourusername/ssdf/issues)
- **Security Issues:** Email security@ssdf.work.gd (do not open public issues)
- **Commercial Questions:** Email commercial@ssdf.work.gd

### Response Times

- Security issues: Within 48 hours
- Bug reports: Within 1 week
- Feature requests: Within 2 weeks
- General questions: Best effort

---

## Recognition

### Contributors

All contributors are listed in:
- README.md contributors section
- CHANGELOG.md for specific contributions
- GitHub contributors page

### Significant Contributions

Major contributions may receive:
- Special mention in release notes
- Free commercial license (if desired)
- Direct contact for future input

---

## License

By contributing to SSDF, you agree that your contributions will be licensed under the MIT License.

Your contributions become part of the project and may be used in commercial licenses sold by SSDF, but the MIT license always applies.

---

## Getting Help

If you need help contributing:

1. Read the documentation thoroughly
2. Check existing issues and PRs
3. Ask in [Discussions](https://github.com/yourusername/ssdf/discussions)
4. Email support@ssdf.work.gd

We're here to help! Don't be afraid to ask questions.

---

## Thank You!

Every contribution makes SSDF better. Whether you're fixing a typo or adding a major feature, we appreciate your time and effort.

Together, we're building an honest, transparent way to distribute and monetize open-source software.

**Happy Contributing! 🎉**

---

**Last Updated:** January 11, 2026  
**Version:** 1.0.0
