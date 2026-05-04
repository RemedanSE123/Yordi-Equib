'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, ShieldAlert, User, Phone, Calendar, DollarSign, AlertCircle, CheckCircle, ChevronDown, X } from 'lucide-react';

interface Customer {
  id: string;
  customerId: string;
  fullName: string;
  phone: string;
  ekubType: string;
}

interface Period {
  value: number;
  label: string;
  selected: boolean;
}

export default function AddPaymentPage() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [amount, setAmount] = useState('');
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<Period[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'round' | 'period' | null>(null);
  const [searchRound, setSearchRound] = useState('');
  const [searchPeriod, setSearchPeriod] = useState('');
  const [dropdownPositions, setDropdownPositions] = useState({ round: 'bottom', period: 'bottom' });

  const roundButtonRef = useRef<HTMLButtonElement>(null);
  const periodButtonRef = useRef<HTMLButtonElement>(null);
  const roundDropdownRef = useRef<HTMLDivElement>(null);
  const periodDropdownRef = useRef<HTMLDivElement>(null);

  const userRole = (session?.user as any)?.role;

  const [customers, setCustomers] = useState<any[]>([]);

  useEffect(() => {
    // We'll fetch all customers once or search on demand
    const fetchCustomers = async () => {
      try {
        const response = await fetch('/api/customers');
        const data = await response.json();
        if (Array.isArray(data)) setCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers:', error);
      }
    };
    fetchCustomers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (roundDropdownRef.current && !roundDropdownRef.current.contains(event.target as Node) &&
        roundButtonRef.current && !roundButtonRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setSearchRound('');
      }
      if (periodDropdownRef.current && !periodDropdownRef.current.contains(event.target as Node) &&
        periodButtonRef.current && !periodButtonRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
        setSearchPeriod('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position
  const calculateDropdownPosition = (buttonRef: React.RefObject<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300;

      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        return 'top';
      }
      return 'bottom';
    }
    return 'bottom';
  };

  const handleRoundDropdownToggle = () => {
    if (openDropdown === 'round') {
      setOpenDropdown(null);
      setSearchRound('');
    } else {
      const position = calculateDropdownPosition(roundButtonRef);
      setDropdownPositions(prev => ({ ...prev, round: position }));
      setOpenDropdown('round');
      setSearchRound('');
    }
  };

  const handlePeriodDropdownToggle = () => {
    if (openDropdown === 'period') {
      setOpenDropdown(null);
      setSearchPeriod('');
    } else {
      const position = calculateDropdownPosition(periodButtonRef);
      setDropdownPositions(prev => ({ ...prev, period: position }));
      setOpenDropdown('period');
      setSearchPeriod('');
    }
  };

  if (!['ADMIN', 'MANAGER', 'SECRETARY', 'COLLECTOR'].includes(userRole)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center max-w-md w-full p-6 rounded-xl border border-red-100 bg-red-50">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={28} />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-sm text-gray-600">You don't have permission to add payments.</p>
        </div>
      </div>
    );
  }

  const handleSearchCustomer = () => {
    const customer = customers.find(
      c => c.customerId.toLowerCase() === searchTerm.toLowerCase() ||
        c.phone === searchTerm
    );

    if (customer) {
      setFoundCustomer(customer);
      setNotFound(false);
      setAmount('');
      setSelectedRound(null);
      // Generate periods based on ekubType
      const typeLabelMap: any = {
        'DAILY': 'Daily EKUB',
        'WEEKLY': 'Weekly EKUB',
        'MONTHLY': 'Monthly EKUB',
        'DAY_105': '105 Days EKUB',
        'SHARE': 'Share EKUB'
      };
      generatePeriods(typeLabelMap[customer.ekubType] || customer.ekubType);
      setSuccess(false);
    } else {
      setFoundCustomer(null);
      setNotFound(true);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRound) {
      alert('Please select a round');
      return;
    }
    const activePeriods = selectedPeriods.filter(p => p.selected);
    if (activePeriods.length === 0) {
      alert('Please select at least one period');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setSubmitting(true);

    try {
      // Record payments for each selected period
      const promises = activePeriods.map(period => 
        fetch('/api/payments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer_id: foundCustomer.id,
            customer_name: foundCustomer.fullName,
            phone: foundCustomer.phone,
            ekub_type: foundCustomer.ekubType,
            amount: parseFloat(amount),
            round_number: selectedRound,
            payment_period: period.value,
            payment_status: 'PAID',
          }),
        })
      );

      const results = await Promise.all(promises);
      if (results.every(r => r.ok)) {
        setSuccess(true);
        setAmount('');
        setSelectedRound(null);
        const resetPeriods = selectedPeriods.map(p => ({ ...p, selected: false }));
        setSelectedPeriods(resetPeriods);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        const errs = await Promise.all(results.filter(r => !r.ok).map(r => r.json()));
        alert(errs[0]?.error || 'Some payments failed to record');
      }
    } catch (error) {
      alert('Failed to connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  const generatePeriods = (ekubType: string) => {
    let periods: Period[] = [];

    switch (ekubType) {
      case 'Daily EKUB':
        periods = Array.from({ length: 30 }, (_, i) => ({ value: i + 1, label: `Day ${i + 1}`, selected: false }));
        break;
      case 'Weekly EKUB':
        periods = Array.from({ length: 60 }, (_, i) => ({ value: i + 1, label: `Week ${i + 1}`, selected: false }));
        break;
      case 'Monthly EKUB':
        const months = ['Meskeram', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit', 'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehasie'];
        periods = months.map((month, i) => ({ value: i + 1, label: month, selected: false }));
        break;
      case '105 Days EKUB':
        periods = Array.from({ length: 105 }, (_, i) => ({ value: i + 1, label: `Day ${i + 1}`, selected: false }));
        break;
      case 'Share EKUB':
        periods = Array.from({ length: 60 }, (_, i) => ({ value: i + 1, label: `Day ${i + 1}`, selected: false }));
        break;
      default:
        periods = [];
    }
    setSelectedPeriods(periods);
  };

  // Round options (1-12)
  const rounds = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: `Round ${i + 1}`
  }));

  const filteredRounds = rounds.filter(round =>
    round.label.toLowerCase().includes(searchRound.toLowerCase())
  );

  const filteredPeriods = selectedPeriods.filter(period =>
    period.label.toLowerCase().includes(searchPeriod.toLowerCase())
  );

  const getRoundLabel = () => {
    if (!selectedRound) return 'Select round';
    return `Round ${selectedRound}`;
  };

  const getPeriodsLabel = () => {
    const selected = selectedPeriods.filter(p => p.selected);
    if (selected.length === 0) return 'Select periods';
    if (selected.length <= 2) return selected.map(p => p.label).join(', ');
    return `${selected.length} periods selected`;
  };

  const togglePeriod = (index: number) => {
    const updatedPeriods = [...selectedPeriods];
    updatedPeriods[index].selected = !updatedPeriods[index].selected;
    setSelectedPeriods(updatedPeriods);
  };

  const selectAllPeriods = () => {
    const updatedPeriods = selectedPeriods.map(period => ({ ...period, selected: true }));
    setSelectedPeriods(updatedPeriods);
  };

  const deselectAllPeriods = () => {
    const updatedPeriods = selectedPeriods.map(period => ({ ...period, selected: false }));
    setSelectedPeriods(updatedPeriods);
  };

  const getSelectedPeriodsCount = () => {
    return selectedPeriods.filter(p => p.selected).length;
  };

  const getTotalAmount = () => {
    const amountNum = parseFloat(amount) || 0;
    return amountNum * getSelectedPeriodsCount();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Add Payment</h1>
          <p className="text-sm text-gray-500 mt-1">Record customer payments for EKUB contributions</p>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search by Customer ID or Phone Number
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomer()}
                placeholder="Enter Customer ID or Phone Number..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none text-sm"
              />
            </div>
            <button
              onClick={handleSearchCustomer}
              className="px-5 py-2.5 bg-[#016cc4] text-white rounded-lg hover:bg-[#0158a3] transition text-sm font-medium"
            >
              Search
            </button>
          </div>

          {notFound && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600" />
              <p className="text-red-700 text-sm">Customer not found. Please check the ID or phone number.</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        {foundCustomer && (
          <>
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm mb-4 sm:mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Customer ID</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <User size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm break-all">{foundCustomer.customerId}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Full Name</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <User size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm break-all">{foundCustomer.fullName}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Phone Number</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <Phone size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm break-all">{foundCustomer.phone}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">EKUB Type</label>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                    <Calendar size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-gray-900 text-sm font-medium">{foundCustomer.ekubType}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-5 shadow-sm">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Payment Details</h2>
              <form onSubmit={handleSubmitPayment}>
                <div className="space-y-5">
                  {/* Amount Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (ETB)
                    </label>
                    <div className="relative">
                      <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#016cc4] focus:border-transparent outline-none text-sm"
                        required
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>

                  {/* Round Selection (1-12, single select) */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Round
                    </label>
                    <button
                      ref={roundButtonRef}
                      type="button"
                      onClick={handleRoundDropdownToggle}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#016cc4] focus:border-transparent text-sm"
                    >
                      <span className={selectedRound ? 'text-gray-900' : 'text-gray-400'}>
                        {getRoundLabel()}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${openDropdown === 'round' ? 'rotate-180' : ''}`} />
                    </button>

                    {openDropdown === 'round' && (
                      <div
                        ref={roundDropdownRef}
                        className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownPositions.round === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                        style={{ maxHeight: '280px', display: 'flex', flexDirection: 'column' }}
                      >
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg">
                          <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={searchRound}
                              onChange={(e) => setSearchRound(e.target.value)}
                              placeholder="Search round..."
                              className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-[#016cc4] focus:border-transparent outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
                          {filteredRounds.length > 0 ? (
                            filteredRounds.map((round) => (
                              <button
                                key={round.value}
                                type="button"
                                onClick={() => {
                                  setSelectedRound(round.value);
                                  setOpenDropdown(null);
                                  setSearchRound('');
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition ${selectedRound === round.value ? 'bg-[#016cc4]/10 text-[#016cc4]' : 'text-gray-700'
                                  }`}
                              >
                                {round.label}
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No rounds found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Period Selection (based on EKUB type, multiple select with checkboxes) */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Periods ({foundCustomer.ekubType})
                    </label>
                    <button
                      ref={periodButtonRef}
                      type="button"
                      onClick={handlePeriodDropdownToggle}
                      className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-[#016cc4] focus:border-transparent text-sm"
                    >
                      <span className={getSelectedPeriodsCount() > 0 ? 'text-gray-900' : 'text-gray-400'}>
                        {getPeriodsLabel()}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${openDropdown === 'period' ? 'rotate-180' : ''}`} />
                    </button>

                    {openDropdown === 'period' && (
                      <div
                        ref={periodDropdownRef}
                        className={`absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg ${dropdownPositions.period === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'}`}
                        style={{ maxHeight: '400px', display: 'flex', flexDirection: 'column' }}
                      >
                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white rounded-t-lg">
                          <div className="relative">
                            <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={searchPeriod}
                              onChange={(e) => setSearchPeriod(e.target.value)}
                              placeholder="Search periods..."
                              className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-[#016cc4] focus:border-transparent outline-none"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </div>

                        <div className="p-2 border-b border-gray-100 flex gap-2 sticky top-0 bg-white">
                          <button
                            type="button"
                            onClick={selectAllPeriods}
                            className="text-xs text-[#016cc4] hover:underline"
                          >
                            Select All
                          </button>
                          <button
                            type="button"
                            onClick={deselectAllPeriods}
                            className="text-xs text-gray-500 hover:underline"
                          >
                            Deselect All
                          </button>
                        </div>

                        <div className="overflow-y-auto" style={{ maxHeight: '250px' }}>
                          {filteredPeriods.length > 0 ? (
                            filteredPeriods.map((period, index) => (
                              <label
                                key={period.value}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={period.selected}
                                  onChange={() => togglePeriod(index)}
                                  className="w-4 h-4 text-[#016cc4] rounded border-gray-300 focus:ring-[#016cc4]"
                                />
                                <span className="text-sm text-gray-700">{period.label}</span>
                              </label>
                            ))
                          ) : (
                            <div className="px-4 py-3 text-sm text-gray-500 text-center">
                              No periods found
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {getSelectedPeriodsCount() > 0 && amount && (
                      <p className="mt-2 text-xs text-gray-500">
                        {getSelectedPeriodsCount()} period{getSelectedPeriodsCount() !== 1 ? 's' : ''} selected • Total: ETB {getTotalAmount().toLocaleString()}
                      </p>
                    )}
                  </div>

                  {success && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      <p className="text-green-700 text-sm">Payment recorded successfully!</p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#016cc4] text-white py-2.5 rounded-lg font-medium hover:bg-[#0158a3] transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {submitting ? 'Processing...' : 'Record Payment'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFoundCustomer(null);
                        setSearchTerm('');
                        setAmount('');
                        setSelectedRound(null);
                        setSelectedPeriods([]);
                        setSuccess(false);
                      }}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition text-sm"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}