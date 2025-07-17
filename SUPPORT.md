# Support

## Getting Help

### Community Support (Free)

#### GitHub Discussions
The best place to ask questions and get help from the community:
- **General Questions**: Use Q&A category
- **Feature Requests**: Use Ideas category  
- **Show and Tell**: Share your projects

#### GitHub Issues
For specific bugs and technical issues:
- Search existing issues first
- Use issue templates
- Provide detailed reproduction steps

#### Documentation
Check our comprehensive documentation:
- [Installation Guide](INSTALL.md)
- [Quick Start Guide](QUICK_START_GUIDE.md)
- [API Documentation](docs/api/)
- [Troubleshooting Guide](docs/troubleshooting.md)

### Commercial Support

#### Professional Support Services
For enterprises and production deployments:
- **Priority Support**: Guaranteed response times
- **Technical Consulting**: Architecture and implementation guidance
- **Custom Development**: Tailored solutions and integrations
- **Training Services**: Team training and workshops

Contact: commercial@aurixlabs.ai

#### Support Tiers

##### Community (Free)
- GitHub Issues and Discussions
- Community documentation
- Best-effort community response
- No SLA guarantees

##### Professional ($500/month per organization)
- Email support with 48-hour response time
- Priority GitHub issue handling
- Monthly office hours calls
- Access to support knowledge base

##### Enterprise ($2000/month per organization)
- 24-hour response time
- Direct access to core developers
- Custom integration support
- Dedicated Slack channel
- Quarterly technical reviews

## Frequently Asked Questions

### Installation & Setup

**Q: Installation fails with npm errors**
A: Try clearing npm cache: `npm cache clean --force` and reinstall

**Q: WASM modules won't load**
A: Ensure you've built them: `wasm-pack build --target web --release`

**Q: ESP32 not connecting**
A: Check WiFi credentials and ensure mesh network is properly configured

### Platform Usage

**Q: How do I create custom agents?**
A: See [Agent Development Guide](docs/agent-development.md)

**Q: Can I use this in production?**
A: Yes, with appropriate testing and validation. Consider professional support.

**Q: What's the performance overhead?**
A: Depends on configuration. See [Performance Guide](docs/performance.md)

### Licensing & Legal

**Q: Can I use this commercially?**
A: Yes, under Elastic License v2.0. Some restrictions apply.

**Q: Do I need to contribute back changes?**
A: Not required, but encouraged for community benefit

**Q: What about patent issues?**
A: License includes patent protection for platform use

### Development

**Q: How do I contribute?**
A: See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines

**Q: What technologies do I need to know?**
A: TypeScript/React for UI, Rust for WASM, Python for hardware

**Q: How do I test my changes?**
A: Run `npm test` for unit tests, see testing guide for integration tests

## Response Time Expectations

### Community Support
- **GitHub Issues**: Best effort, typically 2-7 days
- **Discussions**: Usually within 24-48 hours during weekdays
- **Security Issues**: 24 hours for initial response

### Professional Support
- **Email Response**: Within 48 hours (business days)
- **Critical Issues**: Within 24 hours
- **General Inquiries**: Within 2 business days

### Enterprise Support
- **Critical Issues**: Within 4 hours (24/7)
- **General Issues**: Within 24 hours (business days)
- **Dedicated Channel**: Real-time during business hours

## Before Requesting Support

### For Bug Reports
1. **Search existing issues** first
2. **Check documentation** and FAQ
3. **Try latest version** if possible
4. **Provide minimal reproduction** case
5. **Include system information** (OS, Node version, etc.)

### For Feature Requests
1. **Search existing requests** first
2. **Describe the use case** clearly
3. **Explain why it's valuable** to the community
4. **Consider contributing** the feature yourself

### For General Questions
1. **Check documentation** thoroughly
2. **Search community discussions**
3. **Try the example applications**
4. **Provide context** about your specific use case

## Security Issues

**Do not report security vulnerabilities through public channels.**

Contact: security@aurixlabs.ai

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact assessment
- Suggested fix (if any)

We'll respond within 24 hours and work with you on responsible disclosure.

## Commercial Licensing Questions

For questions about commercial use, enterprise licensing, or partnership opportunities:

Contact: commercial@aurixlabs.ai

Please include:
- Your organization name
- Intended use case
- Scale of deployment
- Timeline requirements

## Training and Workshops

We offer training services for teams getting started with CMA Neural OS:

### Available Training
- **Introduction Workshop** (4 hours): Overview and basic concepts
- **Developer Training** (2 days): Hands-on development training
- **Architecture Deep Dive** (1 day): Advanced architectural concepts
- **Hardware Integration** (1 day): ESP32 and IoT device integration

### Custom Training
We can develop custom training programs for your specific needs.

Contact: training@aurixlabs.ai

## Status Page

Check system status and announcements:
- **Service Status**: Available at status.aurixlabs.ai
- **Maintenance Windows**: Announced 48 hours in advance
- **Incident Reports**: Post-mortem analysis for major issues

---

**We're here to help you succeed with CMA Neural OS!**

*For urgent issues, always check our documentation first, then use the appropriate support channel based on your needs.*