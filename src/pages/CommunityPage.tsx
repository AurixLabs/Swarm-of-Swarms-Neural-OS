import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Github, BookOpen, Heart, Globe, Code2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const CommunityPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Community
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Join the CMA Neural OS community of developers, researchers, and AI enthusiasts
            </p>
            <div className="flex justify-center gap-3">
              <Badge variant="secondary">Open Source</Badge>
              <Badge variant="outline">Global Community</Badge>
              <Badge variant="outline">Collaborative</Badge>
            </div>
          </div>

          <div className="space-y-12">
            {/* Community Channels */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Connect With Us</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center mb-4">
                    <Github className="w-6 h-6 text-primary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">GitHub</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Contribute to the codebase, report issues, and collaborate on development
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    View Repository (Coming Soon)
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-lg border border-secondary/20">
                  <div className="flex items-center mb-4">
                    <MessageSquare className="w-6 h-6 text-secondary mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Discord Server</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Real-time discussions, support, and community events
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Join Discord (Coming Soon)
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center mb-4">
                    <BookOpen className="w-6 h-6 text-accent mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Documentation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive guides, tutorials, and API documentation
                  </p>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/docs/quickstart">
                      Browse Docs
                    </Link>
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 p-6 rounded-lg border border-destructive/20">
                  <div className="flex items-center mb-4">
                    <Globe className="w-6 h-6 text-destructive mr-3" />
                    <h3 className="text-lg font-semibold text-foreground">Forums</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Long-form discussions, Q&A, and knowledge sharing
                  </p>
                  <Button variant="outline" size="sm" disabled>
                    Community Forums (Coming Soon)
                  </Button>
                </div>
              </div>
            </section>

            {/* How to Contribute */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">How to Contribute</h2>
              <div className="space-y-6">
                <div className="bg-muted/20 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Contributing Areas</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Code2 className="w-4 h-4 mr-2 text-primary" />
                        Code Contributions
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Core kernel development</li>
                        <li>• WASM module optimization</li>
                        <li>• UI/UX improvements</li>
                        <li>• Bug fixes and testing</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <BookOpen className="w-4 h-4 mr-2 text-secondary" />
                        Documentation
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Technical documentation</li>
                        <li>• Tutorials and guides</li>
                        <li>• API documentation</li>
                        <li>• Translation support</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Users className="w-4 h-4 mr-2 text-accent" />
                        Community Support
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Help other users</li>
                        <li>• Community moderation</li>
                        <li>• Event organization</li>
                        <li>• Feedback and testing</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2 flex items-center">
                        <Rocket className="w-4 h-4 mr-2 text-destructive" />
                        Research & Innovation
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Algorithm improvements</li>
                        <li>• Performance optimization</li>
                        <li>• Ethics research</li>
                        <li>• Use case development</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/10 p-6 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold text-primary mb-3">Contribution Guidelines</h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      <strong>1. Code Quality:</strong> Follow TypeScript best practices, include comprehensive tests, 
                      and ensure ethical compliance in all contributions.
                    </p>
                    <p>
                      <strong>2. Documentation:</strong> Document new features thoroughly, provide clear examples, 
                      and maintain consistency with existing documentation style.
                    </p>
                    <p>
                      <strong>3. Ethics First:</strong> All contributions must align with our ethics-first approach 
                      and pass ethical validation checks.
                    </p>
                    <p>
                      <strong>4. Community Guidelines:</strong> Be respectful, inclusive, and constructive in all 
                      community interactions and contributions.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Community Stats */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Community Stats</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-muted/20 p-6 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary mb-2">0+</div>
                  <div className="text-sm text-muted-foreground">Contributors</div>
                  <div className="text-xs text-muted-foreground mt-1">(Growing)</div>
                </div>
                <div className="bg-muted/20 p-6 rounded-lg text-center">
                  <div className="text-2xl font-bold text-secondary mb-2">0+</div>
                  <div className="text-sm text-muted-foreground">GitHub Stars</div>
                  <div className="text-xs text-muted-foreground mt-1">(Coming Soon)</div>
                </div>
                <div className="bg-muted/20 p-6 rounded-lg text-center">
                  <div className="text-2xl font-bold text-accent mb-2">0+</div>
                  <div className="text-sm text-muted-foreground">Discord Members</div>
                  <div className="text-xs text-muted-foreground mt-1">(Launching Soon)</div>
                </div>
                <div className="bg-muted/20 p-6 rounded-lg text-center">
                  <div className="text-2xl font-bold text-destructive mb-2">12+</div>
                  <div className="text-sm text-muted-foreground">Core Kernels</div>
                  <div className="text-xs text-muted-foreground mt-1">(Active)</div>
                </div>
              </div>
            </section>

            {/* Community Values */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Our Values</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center mb-3">
                    <Heart className="w-5 h-5 text-primary mr-2" />
                    <h3 className="text-lg font-semibold text-primary">Ethics First</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We prioritize ethical AI development and responsible innovation in everything we do. 
                    Our community is committed to building AI that benefits humanity.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-secondary/10 to-secondary/5 p-6 rounded-lg border border-secondary/20">
                  <div className="flex items-center mb-3">
                    <Globe className="w-5 h-5 text-secondary mr-2" />
                    <h3 className="text-lg font-semibold text-secondary">Global Accessibility</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We believe AI should be accessible to everyone, regardless of location, resources, 
                    or technical background. Our technology is designed for global deployment.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-accent/10 to-accent/5 p-6 rounded-lg border border-accent/20">
                  <div className="flex items-center mb-3">
                    <Users className="w-5 h-5 text-accent mr-2" />
                    <h3 className="text-lg font-semibold text-accent">Collaborative Innovation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    The best solutions emerge from diverse perspectives and collaborative effort. 
                    We foster an inclusive environment where everyone can contribute.
                  </p>
                </div>

                <div className="bg-gradient-to-r from-destructive/10 to-destructive/5 p-6 rounded-lg border border-destructive/20">
                  <div className="flex items-center mb-3">
                    <BookOpen className="w-5 h-5 text-destructive mr-2" />
                    <h3 className="text-lg font-semibold text-destructive">Open Knowledge</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Knowledge should be freely shared. We maintain transparent development processes 
                    and comprehensive documentation for the benefit of all.
                  </p>
                </div>
              </div>
            </section>

            {/* Events & News */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Events & News</h2>
              <div className="bg-muted/20 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h3>
                <div className="space-y-4">
                  <div className="bg-background p-4 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">CMA Neural OS Launch Event</h4>
                      <Badge variant="secondary">Coming Soon</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Join us for the official launch of CMA Neural OS, featuring live demos, 
                      technical presentations, and community discussions.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Date: TBA | Format: Virtual Event
                    </div>
                  </div>

                  <div className="bg-background p-4 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">Developer Workshop Series</h4>
                      <Badge variant="outline">Planning</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Weekly workshops covering kernel development, WASM optimization, and 
                      multi-agent system design.
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Schedule: TBA | Format: Online & In-Person
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Get Started */}
            <section>
              <h2 className="text-2xl font-bold mb-6 text-foreground">Get Started Today</h2>
              <div className="bg-gradient-to-r from-primary/20 via-secondary/10 to-accent/20 rounded-lg border-2 border-primary/30 p-8 text-center">
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  Ready to join the CMA Neural OS community?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Start by exploring the documentation, trying out examples, or contributing to the project.
                </p>
                <div className="flex justify-center gap-4">
                  <Button asChild>
                    <Link to="/docs/quickstart">
                      Get Started
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link to="/examples/assistant">
                      View Examples
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;