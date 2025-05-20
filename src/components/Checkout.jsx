import { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { jsPDF } from 'jspdf';
import { motion } from 'framer-motion';
import { FaTimes, FaCheck, FaDownload } from 'react-icons/fa';

function Checkout({ car, paymentMethod, currency, usdRate, gbpRate, eurRate, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    addressLine1: '',
    addressLine2: '',
    postcode: '',
    city: '',
    country: 'United Kingdom',
    email: '',
    phone: '',
  });
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [step, setStep] = useState('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId] = useState(
    `txid:${Math.random().toString(16).slice(2, 10)}-${Math.random().toString(16).slice(2, 10)}`
  );
  const [invoiceNumber, setInvoiceNumber] = useState(() => {
    const lastNumber = parseInt(localStorage.getItem('lastInvoiceNumber') || '0', 10);
    const newNumber = lastNumber + 1;
    return `INV_${newNumber.toString().padStart(4, '0')}`;
  });

  useEffect(() => {
    if (step === 'success') {
      const number = parseInt(invoiceNumber.replace('INV_', ''), 10);
      localStorage.setItem('lastInvoiceNumber', number);
    }
  }, [step, invoiceNumber]);

  const fakeBtcAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
  const fakeLightningInvoice = 'lnbc1p3s7x8qpp5x9k8zv4q3j9k8zv4q3j9k8zv4q3j9k8zv4q3j9k8zv4q3j9k';

  const fiatPrice = (() => {
    switch (currency) {
      case 'USD':
        return (car.btcPrice * usdRate).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case 'GBP':
        return (car.btcPrice * gbpRate).toLocaleString('en-GB', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      case 'EUR':
        return (car.btcPrice * eurRate).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
      default:
        return '';
    }
  })();

  const currencySymbol = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';

  const countryDiallingCodes = {
    'Algeria': { code: '+213' },
    'Antarctica': { code: '+672' },
    'Australia': { code: '+61' },
    'Austria': { code: '+43' },
    'Belgium': { code: '+32' },
    'Belize': { code: '+501' },
    'Brazil': { code: '+55' },
    'Canada': { code: '+1' },
    'China': { code: '+86' },
    'Colombia': { code: '+57' },
    'Cuba': { code: '+53' },
    'Cyprus': { code: '+357' },
    'Dominican Republic': { code: '+1' },
    'Egypt': { code: '+20' },
    'El Salvador': { code: '+503' },
    'France': { code: '+33' },
    'Germany': { code: '+49' },
    'Hong Kong': { code: '+852' },
    'India': { code: '+91' },
    'Italy': { code: '+39' },
    'Japan': { code: '+81' },
    'Mexico': { code: '+52' },
    'Monaco': { code: '+377' },
    'Netherlands': { code: '+31' },
    'Nigeria': { code: '+234' },
    'North Korea': { code: '+850' },
    'Northern Ireland': { code: '+44' },
    'Norway': { code: '+47' },
    'Pakistan': { code: '+92' },
    'Peru': { code: '+51' },
    'Poland': { code: '+48' },
    'Portugal': { code: '+351' },
    'Qatar': { code: '+974' },
    'Republic of Ireland': { code: '+353' },
    'Romania': { code: '+40' },
    'Russia': { code: '+7' },
    'Saudi Arabia': { code: '+966' },
    'Singapore': { code: '+65' },
    'South Africa': { code: '+27' },
    'South Korea': { code: '+82' },
    'Spain': { code: '+34' },
    'Sweden': { code: '+46' },
    'Switzerland': { code: '+41' },
    'Taiwan': { code: '+886' },
    'Turkey': { code: '+90' },
    'Ukraine': { code: '+380' },
    'United Arab Emirates': { code: '+971' },
    'United Kingdom': { code: '+44' },
    'United States': { code: '+1' },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      formData.name &&
      formData.addressLine1 &&
      formData.postcode &&
      formData.city &&
      formData.country &&
      formData.email &&
      formData.phone &&
      termsAgreed
    ) {
      setIsSubmitting(true);
      setTimeout(() => {
        setStep('payment');
        setTimeout(() => {
          setStep('success');
          setIsSubmitting(false);
        }, 10000);
      }, 1000);
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Based Motors', 20, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('123 Crypto Lane, London, UK', 20, 30);
    doc.text('Email: sales@basedmotors.com', 20, 35);
    doc.text('Phone: +44 20 1234 5678', 20, 40);
    
    doc.setFontSize(14);
    doc.text(`Invoice #${invoiceNumber}`, 150, 20);
    doc.text(`Date: ${new Date().toISOString().split('T')[0]}`, 150, 30);
    
    doc.setFontSize(12);
    doc.text('Bill To:', 20, 60);
    doc.text(formData.name, 20, 70);
    doc.text(formData.addressLine1, 20, 75);
    if (formData.addressLine2) doc.text(formData.addressLine2, 20, 80);
    doc.text(`${formData.postcode} ${formData.city}`, 20, formData.addressLine2 ? 85 : 80);
    doc.text(formData.country, 20, formData.addressLine2 ? 90 : 85);
    doc.text(`Email: ${formData.email}`, 20, formData.addressLine2 ? 95 : 90);
    doc.text(`Phone: ${countryDiallingCodes[formData.country]?.code || ''}${formData.phone}`, 20, formData.addressLine2 ? 100 : 95);
    
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 110, 170, 10, 'F');
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text('Description', 22, 116);
    doc.text('Quantity', 100, 116);
    doc.text('Unit Price', 130, 116);
    doc.text('Total', 160, 116);
    
    doc.setFontSize(10);
    doc.text(car.name, 22, 126);
    doc.text('1', 100, 126);
    doc.text(`${car.btcPrice.toFixed(4)} BTC`, 130, 126);
    doc.text(`${currencySymbol}${fiatPrice}`, 160, 126);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', 130, 140);
    doc.text(`${currencySymbol}${fiatPrice}`, 160, 140);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`Payment Method: ${paymentMethod}`, 20, 160);
    doc.text(`Transaction ID: ${transactionId}`, 20, 165);
    
    doc.setFontSize(10);
    doc.text('Thank you for your purchase!', 20, 190);
    doc.text('Terms: Payment completed via Bitcoin.', 20, 195);
    doc.text('Contact us at sales@basedmotors.com for any queries.', 20, 200);
    
    doc.save(`Based_Motors_${invoiceNumber}_${car.name.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {step === 'form' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 font-montserrat">
              Checkout: {car.name}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="addressLine1"
                  value={formData.addressLine1}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  name="addressLine2"
                  value={formData.addressLine2}
                  onChange={handleInputChange}
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Postcode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  City/Town <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-inter"
                >
                  <option value="Algeria">Algeria</option>
                  <option value="Antarctica">Antarctica</option>
                  <option value="Australia">Australia</option>
                  <option value="Austria">Austria</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Belize">Belize</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Canada">Canada</option>
                  <option value="China">China</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Egypt">Egypt</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="France">France</option>
                  <option value="Germany">Germany</option>
                  <option value="Hong Kong">Hong Kong</option>
                  <option value="India">India</option>
                  <option value="Italy">Italy</option>
                  <option value="Japan">Japan</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="North Korea">North Korea</option>
                  <option value="Northern Ireland">Northern Ireland</option>
                  <option value="Norway">Norway</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Peru">Peru</option>
                  <option value="Poland">Poland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Republic of Ireland">Republic of Ireland</option>
                  <option value="Romania">Romania</option>
                  <option value="Russia">Russia</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Singapore">Singapore</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Korea">South Korea</option>
                  <option value="Spain">Spain</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Ukraine">Ukraine</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-inter">
                    {countryDiallingCodes[formData.country]?.code || ''}
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="flex-1 p-2 rounded-r-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-inter">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-inter"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-inter">
                  <input
                    type="checkbox"
                    checked={termsAgreed}
                    onChange={(e) => setTermsAgreed(e.target.checked)}
                    className="mr-2"
                    required
                  />
                  I agree to the terms and conditions of Based Motors <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center text-sm text-gray-500 dark:text-gray-400 font-inter">
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    className="mr-2"
                  />
                  I agree to receive the Based Motors newsletter for latest product updates, offers, and promotions
                </label>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={isSubmitting || !termsAgreed}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 font-inter flex items-center justify-center gap-2"
                >
                  <FaCheck className="h-5 w-5" />
                  {isSubmitting ? 'Processing...' : 'Proceed to Payment'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors font-inter flex items-center justify-center gap-2"
                >
                  <FaTimes className="h-5 w-5" />
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
        {step === 'payment' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 font-montserrat">
              Pay for {car.name}
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
              Please send {car.btcPrice.toFixed(4)} BTC to:
            </p>
            <div className="flex justify-center mb-4">
              {paymentMethod === 'Bitcoin' ? (
                <QRCode value={fakeBtcAddress} size={128} />
              ) : (
                <QRCode value={fakeLightningInvoice} size={128} />
              )}
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 break-all font-inter">
              {paymentMethod === 'Bitcoin' ? fakeBtcAddress : fakeLightningInvoice}
            </p>
            <p className="text-gray-700 dark:text-gray-300 text-center font-inter">
              Simulating payment... (10 seconds)
            </p>
          </>
        )}
        {step === 'success' && (
          <>
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100 font-montserrat">
              Congratulations, {formData.name}!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-inter">
              You’ve purchased a {car.name}!
            </p>
            <div className="w-full h-64 mb-4">
              <img
                src={car.image}
                alt={car.name}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4 break-all font-inter">
              Transaction ID: {transactionId}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={generatePDF}
                className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 transition-colors font-inter flex items-center justify-center gap-2"
              >
                <FaDownload className="h-5 w-5" />
                Download Invoice
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-lg hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-100 dark:hover:bg-gray-500 transition-colors font-inter flex items-center justify-center gap-2"
              >
                <FaTimes className="h-5 w-5" />
                Close
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default Checkout;