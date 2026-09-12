import React, { useState, useMemo } from 'react';
import ProductFilters from '../components/scanned-products/ProductFilters';
import ProductsTable from '../components/scanned-products/ProductsTable';
import Pagination from '../components/scanned-products/Pagination';
import ProductDetailsPage from './ProductDetailsPage';
import { SCANNED_PRODUCTS_DATA } from '../data/scannedProductsMockData';
import { Package, CheckCircle2, AlertOctagon, Clock } from 'lucide-react';
import './ScannedProductsPage.css';

const ITEMS_PER_PAGE = 8;

function ScannedProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products based on search and filters
  const filteredProducts = useMemo(() => {
    return SCANNED_PRODUCTS_DATA.filter((item) => {
      // 1. Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = item.productName.toLowerCase().includes(query);
        const matchesMfg = item.manufacturer.toLowerCase().includes(query);
        const matchesInsp = item.inspector.toLowerCase().includes(query);
        const matchesId = item.inspectionId.toLowerCase().includes(query);

        if (!matchesName && !matchesMfg && !matchesInsp && !matchesId) {
          return false;
        }
      }

      // 2. Status filter
      if (selectedStatus !== 'All' && item.status !== selectedStatus) {
        return false;
      }

      // 3. Category filter
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // 4. Period filter
      if (
        selectedPeriod === 'Today' &&
        !item.inspectionDate.startsWith('2026-09-12')
      ) {
        return false;
      }

      if (
        selectedPeriod === 'Last3Days' &&
        !item.inspectionDate.startsWith('2026-09-12') &&
        !item.inspectionDate.startsWith('2026-09-11') &&
        !item.inspectionDate.startsWith('2026-09-10')
      ) {
        return false;
      }

      if (
        selectedPeriod === 'Last7Days' &&
        !item.inspectionDate.startsWith('2026-09-12') &&
        !item.inspectionDate.startsWith('2026-09-11') &&
        !item.inspectionDate.startsWith('2026-09-10') &&
        !item.inspectionDate.startsWith('2026-09-09') &&
        !item.inspectionDate.startsWith('2026-09-08') &&
        !item.inspectionDate.startsWith('2026-09-07')
      ) {
        return false;
      }

      return true;
    });
  }, [
    searchTerm,
    selectedStatus,
    selectedCategory,
    selectedPeriod
  ]);

  // Reset pagination when search or filters change
  const handleSearchChange = (val) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleStatusChange = (val) => {
    setSelectedStatus(val);
    setCurrentPage(1);
  };

  const handleCategoryChange = (val) => {
    setSelectedCategory(val);
    setCurrentPage(1);
  };

  const handlePeriodChange = (val) => {
    setSelectedPeriod(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setSelectedCategory('All');
    setSelectedPeriod('All');
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    selectedStatus !== 'All' ||
    selectedCategory !== 'All' ||
    selectedPeriod !== 'All'
  );

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // Aggregate stats for the compact summary strip
  const summaryCounts = useMemo(() => {
    const total = SCANNED_PRODUCTS_DATA.length;

    const compliant = SCANNED_PRODUCTS_DATA.filter(
      (i) => i.status === 'Compliant'
    ).length;

    const nonCompliant = SCANNED_PRODUCTS_DATA.filter(
      (i) => i.status === 'Non-Compliant'
    ).length;

    const underReview = SCANNED_PRODUCTS_DATA.filter(
      (i) => i.status === 'Under Review'
    ).length;

    return {
      total,
      compliant,
      nonCompliant,
      underReview
    };
  }, []);

  // Show the actual Step 5 Product Details page
  if (selectedProduct) {
    return (
      <ProductDetailsPage
        product={selectedProduct}
        onBack={() => setSelectedProduct(null)}
      />
    );
  }

  return (
    <div className="scanned-products-page">

      {/* 1. Page Header with Record Count Badge */}
      <div className="page-header-row">
        <div>
          <h2 className="page-main-heading">Scanned Products</h2>

          <p className="page-sub-heading">
            Review packaged commodity inspections and compliance verification records.
          </p>
        </div>

        <div className="matched-counter-pill">
          <span>
            Displaying <strong>{totalItems}</strong> of{' '}
            <strong>{SCANNED_PRODUCTS_DATA.length}</strong> inspections
          </span>
        </div>
      </div>

      {/* 2. Compact Summary Strip */}
      <div className="compact-summary-strip">

        <div className="summary-pill pill-total">
          <Package size={15} />

          <span>
            Total Scanned: <strong>{summaryCounts.total}</strong>
          </span>
        </div>

        <div className="summary-pill pill-compliant">
          <CheckCircle2 size={15} />

          <span>
            Compliant: <strong>{summaryCounts.compliant}</strong>
          </span>
        </div>

        <div className="summary-pill pill-non-compliant">
          <AlertOctagon size={15} />

          <span>
            Non-Compliant: <strong>{summaryCounts.nonCompliant}</strong>
          </span>
        </div>

        <div className="summary-pill pill-warning">
          <Clock size={15} />

          <span>
            Under Review: <strong>{summaryCounts.underReview}</strong>
          </span>
        </div>

      </div>

      {/* 3. Search & Filter Bar */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        selectedPeriod={selectedPeriod}
        onPeriodChange={handlePeriodChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {/* 4. Scanned Products Data Table */}
      <ProductsTable
        products={paginatedProducts}
        onViewDetails={(item) => setSelectedProduct(item)}
      />

      {/* 5. Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

    </div>
  );
}

export default ScannedProductsPage;