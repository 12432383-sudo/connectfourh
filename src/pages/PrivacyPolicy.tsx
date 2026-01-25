import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
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

        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-8">Last updated: January 25, 2025</p>

        <div className="space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">Introduction</h2>
            <p>
              Welcome to Connect 4 ("we," "our," or "us"). We respect your privacy and are 
              committed to protecting your personal data. This privacy policy explains how 
              we handle information when you use our mobile application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Information We Collect</h2>
            <p className="mb-3">
              Connect 4 is designed with privacy in mind. We collect minimal information:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Game Data:</strong> Your game scores and preferences are stored 
                locally on your device and are not transmitted to our servers.
              </li>
              <li>
                <strong>Device Information:</strong> Basic device information may be collected 
                for app functionality and crash reporting.
              </li>
              <li>
                <strong>Advertising Data:</strong> If ads are displayed, our advertising 
                partners may collect anonymized data to serve relevant ads.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">How We Use Your Information</h2>
            <p className="mb-3">We use the collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain the game functionality</li>
              <li>Save your game progress and preferences locally</li>
              <li>Improve app performance and fix bugs</li>
              <li>Display advertisements (if applicable)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Data Storage</h2>
            <p>
              All game data, including scores and settings, is stored locally on your device. 
              We do not maintain external servers that store your personal gaming data. If you 
              uninstall the app, all locally stored data will be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Third-Party Services</h2>
            <p className="mb-3">Our app may use the following third-party services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Google AdMob:</strong> For displaying advertisements. AdMob may collect 
                device identifiers and usage data. See{" "}
                <a 
                  href="https://policies.google.com/privacy" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Google's Privacy Policy
                </a>.
              </li>
              <li>
                <strong>App Store / Play Store:</strong> Subject to Apple's and Google's 
                respective privacy policies.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
            <p>
              Connect 4 is suitable for all ages. We do not knowingly collect personal 
              information from children under 13. The game can be played without providing 
              any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Delete your local game data by uninstalling the app</li>
              <li>Opt out of personalized advertising through your device settings</li>
              <li>Request information about data we may have collected</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of 
              any changes by posting the new privacy policy on this page and updating the 
              "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">Contact Us</h2>
            <p>
              If you have any questions about this privacy policy, please contact us at:{" "}
              <a 
                href="mailto:hikmatnoun14@gmail.com" 
                className="text-primary hover:underline"
              >
                hikmatnoun14@gmail.com
              </a>
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

export default PrivacyPolicy;
