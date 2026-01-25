import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const TermsOfService = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Game
        </Link>

        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 25, 2025</p>

        <div className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By downloading, installing, or using Connect 4 ("the App"), you agree to be 
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
              please do not use the App.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>
              Connect 4 is a mobile game application that allows users to play the classic 
              Connect Four board game. The App offers single-player mode against AI opponents 
              and local two-player mode.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. License Grant</h2>
            <p className="mb-3">
              We grant you a limited, non-exclusive, non-transferable, revocable license to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Download and install the App on your personal mobile device</li>
              <li>Use the App for personal, non-commercial entertainment purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Restrictions</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Copy, modify, or distribute the App or its content</li>
              <li>Reverse engineer, decompile, or disassemble the App</li>
              <li>Remove any copyright or proprietary notices from the App</li>
              <li>Use the App for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to any part of the App</li>
              <li>Use automated systems or software to extract data from the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the App, including but not limited 
              to text, graphics, logos, icons, images, audio clips, and software, are the 
              exclusive property of Connect 4 and are protected by copyright, trademark, and 
              other intellectual property laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Advertisements</h2>
            <p>
              The App may display advertisements provided by third-party advertising networks. 
              These advertisements may be targeted based on information collected by such 
              networks. We are not responsible for the content of third-party advertisements 
              or any products or services advertised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Disclaimer of Warranties</h2>
            <p>
              THE APP IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, 
              EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, 
              ERROR-FREE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, 
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS 
              OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, 
              GOODWILL, OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE APP.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Connect 4 and its officers, directors, 
              employees, and agents from any claims, damages, losses, liabilities, and expenses 
              (including attorneys' fees) arising out of your use of the App or violation of 
              these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to the App at any time, 
              without notice, for any reason, including breach of these Terms. Upon termination, 
              your right to use the App will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p>
              We may modify these Terms at any time. We will notify you of any changes by 
              updating the "Last updated" date at the top of this page. Your continued use 
              of the App after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of 
              the jurisdiction in which the App developer is located, without regard to its 
              conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:{" "}
              <a 
                href="mailto:support@connect4game.com" 
                className="text-primary hover:underline"
              >
                support@connect4game.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">14. Additional Terms</h2>
            <p>
              Your use of the App is also subject to our{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Connect 4. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
