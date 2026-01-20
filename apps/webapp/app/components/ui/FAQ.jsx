"use client"

import Link from "next/link"
import {
  ContentPage,
  ContentTitle,
  ContentSection,
  ContentHeading,
  ContentSubheading,
  ContentParagraph,
  ContentInlineLink,
} from "@/components/ui/uiStyles"
import { SUPPORT_PHONE_NUMBER, SUPPORT_PHONE_TEL_HREF } from "@/constants.js"

export default function FAQ() {
  let supportPhoneLink = null
  if (SUPPORT_PHONE_NUMBER && SUPPORT_PHONE_TEL_HREF) {
    supportPhoneLink = (
      <ContentInlineLink href={SUPPORT_PHONE_TEL_HREF}>
        {SUPPORT_PHONE_NUMBER}
      </ContentInlineLink>
    )
  }

  let supportPhoneText = null
  if (SUPPORT_PHONE_NUMBER && !SUPPORT_PHONE_TEL_HREF) {
    supportPhoneText = SUPPORT_PHONE_NUMBER
  }

  return (
    <ContentPage>
      <ContentTitle>Frequently Asked Questions</ContentTitle>

      <ContentSection>
        <ContentHeading>Encabulators & Retroencabulation</ContentHeading>

        <ContentSubheading>What is a retroencabulator?</ContentSubheading>
        <ContentParagraph>
          A retroencabulator is a sophisticated piece of industrial equipment
          designed to manage the complex interactions between hydrocoptic
          marzelvanes and prefamulated amulite bases. The device utilizes
          panendermic semi-boloid slots to achieve optimal retroencabulation
          efficiency, making it essential for any operation requiring precise
          control over marzelvane oscillations and amulite phase transitions.
        </ContentParagraph>

        <ContentSubheading>
          How do hydrocoptic marzelvanes work?
        </ContentSubheading>
        <ContentParagraph>
          Hydrocoptic marzelvanes are precision-engineered components that
          facilitate the retroencabulation process by modulating the flow of
          panendermic energy through prefamulated amulite substrates. Each
          marzelvane is calibrated to operate within specific frequency ranges,
          ensuring optimal performance when integrated with compatible
          retroencabulation systems. The exact mechanism involves complex
          quantum interactions that are best understood by our certified
          retroencabulation engineers.
        </ContentParagraph>

        <ContentSubheading>What is prefamulated amulite?</ContentSubheading>
        <ContentParagraph>
          Prefamulated amulite is a proprietary material developed specifically
          for retroencabulation applications. This advanced compound provides
          the structural foundation necessary for stable marzelvane operation
          and efficient panendermic energy transfer. Our prefamulated amulite
          bases are manufactured to exacting specifications, ensuring consistent
          performance across all retroencabulation systems.
        </ContentParagraph>

        <ContentSubheading>
          Why do I need panendermic semi-boloid slots?
        </ContentSubheading>
        <ContentParagraph>
          Panendermic semi-boloid slots are critical components that enable the
          precise alignment and synchronization of hydrocoptic marzelvanes
          within a retroencabulation system. Without properly configured
          semi-boloid slots, your retroencabulator may experience reduced
          efficiency, increased marzelvane wear, and potential system
          instability. Our standard and premium slot configurations are designed
          to meet various operational requirements.
        </ContentParagraph>

        <ContentSubheading>
          Can I use third-party marzelvanes with Ballast retroencabulators?
        </ContentSubheading>
        <ContentParagraph>
          While technically possible, we strongly recommend using only
          Ballast-certified hydrocoptic marzelvanes to ensure optimal
          performance and maintain warranty coverage. Third-party marzelvanes
          may not be properly calibrated for our prefamulated amulite systems,
          potentially leading to reduced efficiency, premature component
          failure, or voiding of your warranty. We cannot provide support or
          assume liability for issues arising from the use of non-certified
          components.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Products & Services</ContentHeading>

        <ContentSubheading>What products does Ballast offer?</ContentSubheading>
        <ContentParagraph>
          We offer a comprehensive range of retroencabulation products,
          including complete retroencabulator systems (Turbo, Standard, and
          Compact models), replacement parts (hydrocoptic marzelvanes,
          prefamulated amulite bases, panendermic semi-boloid slots, and various
          filters), and accessories (mounting brackets, cable assemblies,
          calibration tools, and maintenance kits). All products are designed to
          work seamlessly together within our retroencabulation ecosystem.
        </ContentParagraph>

        <ContentSubheading>
          What services does Ballast provide?
        </ContentSubheading>
        <ContentParagraph>
          Our service offerings include Retroencabulation Consulting (expert
          analysis and optimization of your systems), Preventive Maintenance
          Programs (scheduled maintenance to prevent failures), Emergency Repair
          Services (rapid response for critical system failures), and Custom
          Configuration Services (tailored retroencabulation solutions for
          specific requirements). Each service is designed to maximize the
          performance and longevity of your retroencabulation infrastructure.
        </ContentParagraph>

        <ContentSubheading>
          How do I know which retroencabulator model is right for me?
        </ContentSubheading>
        <ContentParagraph>
          The appropriate retroencabulator model depends on your specific
          operational requirements, including expected marzelvane load,
          available space, and performance needs. Our Turbo model is ideal for
          high-demand industrial applications, the Standard model suits most
          general-purpose retroencabulation needs, and the Compact model is
          perfect for space-constrained environments. We recommend consulting
          with our retroencabulation experts to determine the best fit for your
          situation.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Orders & Shipping</ContentHeading>

        <ContentSubheading>How do I place an order?</ContentSubheading>
        <ContentParagraph>
          You can place orders directly through our website by adding products
          or services to your cart and proceeding through our secure checkout
          process. For custom configurations or large orders, we recommend
          contacting our sales team to discuss your specific requirements and
          ensure proper retroencabulation system compatibility.
        </ContentParagraph>

        <ContentSubheading>
          What payment methods do you accept?
        </ContentSubheading>
        <ContentParagraph>
          We accept major credit cards, debit cards, and various digital payment
          methods through our secure payment processing partners. All
          transactions are encrypted and processed in accordance with industry
          security standards to protect your financial information.
        </ContentParagraph>

        <ContentSubheading>How long does shipping take?</ContentSubheading>
        <ContentParagraph>
          Shipping times vary depending on product availability, your location,
          and the selected shipping method. Standard orders are typically
          processed within 2-3 business days and shipped via standard ground
          shipping, which generally takes 5-7 business days. Expedited shipping
          options are available for urgent retroencabulation needs. You will
          receive tracking information once your order has been shipped.
        </ContentParagraph>

        <ContentSubheading>Do you ship internationally?</ContentSubheading>
        <ContentParagraph>
          Yes, we ship to most international destinations. However, shipping
          times, costs, and customs requirements vary by country. Some
          retroencabulation products may be subject to export restrictions or
          require special documentation. Please contact us before placing an
          international order to confirm availability and shipping options for
          your location.
        </ContentParagraph>

        <ContentSubheading>
          Can I cancel my order after it's been placed?
        </ContentSubheading>
        <ContentParagraph>
          If you need to cancel or change an order, please call us as soon as
          possible. You can also reach us via our{" "}
          <ContentInlineLink as={Link} href="/contact">
            contact page
          </ContentInlineLink>
          .
        </ContentParagraph>
        {supportPhoneLink && (
          <ContentParagraph>Support phone: {supportPhoneLink}</ContentParagraph>
        )}
        {supportPhoneText && (
          <ContentParagraph>Support phone: {supportPhoneText}</ContentParagraph>
        )}
      </ContentSection>

      <ContentSection>
        <ContentHeading>Refunds & Returns</ContentHeading>

        <ContentSubheading>What is your refund policy?</ContentSubheading>
        <ContentParagraph>
          Due to the specialized nature of retroencabulation technology and the
          proprietary configuration of our hydrocoptic marzelvane systems, all
          sales are generally final. Once a prefamulated amulite base has been
          activated or a panendermic semi-boloid slot has been configured, the
          transaction is considered complete and non-refundable. However, we may
          consider refund requests on a case-by-case basis for unopened, unused
          products returned within 14 days of purchase, subject to restocking
          fees and return shipping costs.
        </ContentParagraph>

        <ContentSubheading>How do I get a refund?</ContentSubheading>
        <ContentParagraph>
          You can request a refund from your account (typically from your order
          details), or contact us for help. If it’s time-sensitive, please call
          us.
        </ContentParagraph>
        <ContentParagraph>
          Helpful links:{" "}
          <ContentInlineLink as={Link} href="/account">
            account
          </ContentInlineLink>
          ,{" "}
          <ContentInlineLink as={Link} href="/account/settings">
            settings
          </ContentInlineLink>
          ,{" "}
          <ContentInlineLink as={Link} href="/contact">
            contact support
          </ContentInlineLink>
          .
        </ContentParagraph>
        {supportPhoneLink && (
          <ContentParagraph>Support phone: {supportPhoneLink}</ContentParagraph>
        )}
        {supportPhoneText && (
          <ContentParagraph>Support phone: {supportPhoneText}</ContentParagraph>
        )}

        <ContentSubheading>
          Can I return a product if it doesn't meet my needs?
        </ContentSubheading>
        <ContentParagraph>
          We recommend carefully reviewing product specifications and consulting
          with our team before purchase to ensure compatibility with your
          retroencabulation requirements. Returns are generally not accepted for
          products that have been opened, installed, or configured, as these
          actions may affect the product's condition and resale value. If you
          have concerns about product compatibility, please contact us before
          making a purchase.
        </ContentParagraph>

        <ContentSubheading>
          What if my product arrives damaged or defective?
        </ContentSubheading>
        <ContentParagraph>
          If you receive a damaged or defective product, please contact us
          immediately with photos and a description of the issue. We will
          investigate the matter and, if the damage or defect is confirmed to be
          our responsibility, we will arrange for a replacement or repair at no
          additional cost to you. Please note that damage caused by improper
          handling, installation, or use may not be covered under our warranty.
        </ContentParagraph>

        <ContentSubheading>Are services refundable?</ContentSubheading>
        <ContentParagraph>
          Services, including consulting, maintenance, and repair services, are
          generally non-refundable once performed. However, if you are
          dissatisfied with a service, please contact us to discuss your
          concerns. We strive to ensure customer satisfaction and may offer
          additional support or service credits in appropriate circumstances.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Subscriptions</ContentHeading>

        <ContentSubheading>
          What subscription services does Ballast offer?
        </ContentSubheading>
        <ContentParagraph>
          We offer subscription-based access to our Preventive Maintenance
          Programs, which provide regular scheduled maintenance, priority
          support, and discounted rates on parts and services. Subscriptions are
          available in monthly, quarterly, and annual plans, with varying levels
          of service coverage depending on your retroencabulation infrastructure
          needs.
        </ContentParagraph>

        <ContentSubheading>
          How does subscription billing work?
        </ContentSubheading>
        <ContentParagraph>
          Subscription fees are automatically charged to your payment method on
          a recurring basis according to your selected billing cycle (monthly,
          quarterly, or annually). You will receive email notifications before
          each billing cycle, and you can update your payment information or
          billing preferences through your account dashboard at any time.
        </ContentParagraph>

        <ContentSubheading>Can I cancel my subscription?</ContentSubheading>
        <ContentParagraph>
          Yes. You can cancel your subscription from{" "}
          <ContentInlineLink as={Link} href="/account/settings">
            account settings
          </ContentInlineLink>
          .
        </ContentParagraph>

        <ContentSubheading>What happens if my payment fails?</ContentSubheading>
        <ContentParagraph>
          If a subscription payment fails, we will attempt to process the
          payment again using your stored payment method. If payment continues
          to fail, your subscription may be suspended or cancelled, and you may
          lose access to subscription benefits. We will notify you via email of
          any payment issues and provide instructions for updating your payment
          information.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Financing</ContentHeading>

        <ContentSubheading>Do you offer financing options?</ContentSubheading>
        <ContentParagraph>
          Yes, we offer flexible financing options to help make
          retroencabulation solutions more accessible. Financing is available
          for qualifying purchases, allowing you to spread the cost of products
          and services over time through scheduled payment plans. Terms and
          eligibility depend on various factors, including purchase amount,
          credit history, and other criteria.
        </ContentParagraph>

        <ContentSubheading>How do I apply for financing?</ContentSubheading>
        <ContentParagraph>
          Financing options are available during checkout for eligible
          purchases. You can select the financing option and complete a brief
          application process, which typically includes providing basic
          financial information and consenting to a credit check. Approval
          decisions are usually provided within minutes, and if approved, you
          can complete your purchase using the financing plan.
        </ContentParagraph>

        <ContentSubheading>What are the financing terms?</ContentSubheading>
        <ContentParagraph>
          Financing terms vary based on the purchase amount, your credit
          profile, and the specific financing program selected. Common terms
          include 6-month, 12-month, and 24-month payment plans, with interest
          rates and fees depending on the selected terms and your
          creditworthiness. Detailed terms and conditions will be provided
          during the financing application process.
        </ContentParagraph>

        <ContentSubheading>Can I pay off my financing early?</ContentSubheading>
        <ContentParagraph>
          Yes, you can typically pay off your financing balance early without
          penalty. Early payment may reduce the total interest you pay over the
          life of the financing agreement. You can make early payments or pay
          off the full balance through your account dashboard or by contacting
          our financing department.
        </ContentParagraph>

        <ContentSubheading>
          How can I manage my financing plan(s)?
        </ContentSubheading>
        <ContentParagraph>
          You can manage your financing plans from{" "}
          <ContentInlineLink as={Link} href="/account/settings">
            account settings
          </ContentInlineLink>
          . If you need help, please{" "}
          <ContentInlineLink as={Link} href="/contact">
            contact support
          </ContentInlineLink>
          .
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Support & Maintenance</ContentHeading>

        <ContentSubheading>How do I get technical support?</ContentSubheading>
        <ContentParagraph>
          Technical support is available through various channels, including
          email, phone, and our online support portal. Support hours and
          response times may vary depending on your subscription level and the
          nature of your inquiry. Priority support is available to subscribers
          of our maintenance programs.
        </ContentParagraph>

        <ContentSubheading>
          Do you provide installation services?
        </ContentSubheading>
        <ContentParagraph>
          While many retroencabulation products can be self-installed by
          qualified technicians, we offer professional installation services for
          customers who prefer expert assistance. Installation services can be
          arranged as part of your purchase or scheduled separately. Our
          certified retroencabulation engineers ensure proper configuration and
          optimal system performance.
        </ContentParagraph>

        <ContentSubheading>
          What maintenance is required for retroencabulators?
        </ContentSubheading>
        <ContentParagraph>
          Regular maintenance is essential for optimal retroencabulation
          performance and longevity. Recommended maintenance includes periodic
          inspection of hydrocoptic marzelvanes, calibration of panendermic
          semi-boloid slots, replacement of prefamulated amulite filters, and
          system performance optimization. Our Preventive Maintenance Programs
          provide scheduled maintenance services to keep your systems operating
          at peak efficiency.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Account & Security</ContentHeading>

        <ContentSubheading>How do I create an account?</ContentSubheading>
        <ContentParagraph>
          You can create an account during checkout or by visiting our
          registration page. Account creation requires providing basic
          information such as your name, email address, and a secure password.
          Once created, your account allows you to track orders, manage
          subscriptions, access support resources, and view your purchase
          history.
        </ContentParagraph>

        <ContentSubheading>
          What should I do if I forget my password?
        </ContentSubheading>
        <ContentParagraph>
          If you forget your password, you can use the "Forgot Password" link on
          the login page to request a password reset. You will receive an email
          with instructions for resetting your password. If you experience
          issues with password reset, please contact our support team for
          assistance.
        </ContentParagraph>

        <ContentSubheading>
          How do I update my account information?
        </ContentSubheading>
        <ContentParagraph>
          You can update your account information, including contact details,
          shipping addresses, and payment methods, through your account
          dashboard. It's important to keep your information current to ensure
          accurate order processing and timely communication regarding your
          retroencabulation products and services.
        </ContentParagraph>
      </ContentSection>

      <ContentSection>
        <ContentHeading>Still Have Questions?</ContentHeading>
        <ContentParagraph>
          If you have additional questions that aren't covered in this FAQ,
          please don't hesitate to contact our customer service team. We're here
          to help you navigate the world of retroencabulation and ensure you get
          the most out of your hydrocoptic marzelvane systems and prefamulated
          amulite infrastructure.
        </ContentParagraph>
      </ContentSection>
    </ContentPage>
  )
}
