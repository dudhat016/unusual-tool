import React, { useState } from 'react';
import {
  Button,
  IconButton,
  LoadingButton,
  Input,
  NumberInput,
  SearchInput,
  Textarea,
  Select,
  CustomSelect,
  Checkbox,
  RadioGroup,
  Switch,
  Slider,
  SegmentedControl,
  Tabs,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Badge,
  Chip,
  Tooltip,
  Modal,
  ConfirmDialog,
  Alert,
  Progress,
  Spinner,
  Skeleton,
  EmptyState,
  ErrorState,
  Breadcrumb,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  DataTable,
  CommonTable,
  DataTableColumn,
  FormField,
  DropdownMenu,
  LanguageSwitcher,
  CopyButton,
  DownloadButton,
  Accordion,
  FileUploader,
} from '../components/ui';
import { useTranslation } from '../i18n';
import { useApp } from '../context/AppContext';

export const UIKitCatalogView: React.FC = () => {
  const { t, language } = useTranslation();
  const { showToast } = useApp();

  // State for interactive UI catalog showcase
  const [activeTab, setActiveTab] = useState('buttons');
  const [inputValue, setInputValue] = useState('Sample Text');
  const [numberVal, setNumberVal] = useState(250);
  const [textareaVal, setTextareaVal] = useState('High precision client-side processing');
  const [selectVal, setSelectVal] = useState('webp');
  const [customSelectVal, setCustomSelectVal] = useState('webp');
  const [multiSelectVal, setMultiSelectVal] = useState(['resize', 'compress']);
  const [checkboxVal, setCheckboxVal] = useState(true);
  const [radioVal, setRadioVal] = useState('recommended');
  const [switchVal, setSwitchVal] = useState(true);
  const [sliderVal, setSliderVal] = useState(75);
  const [segVal, setSegVal] = useState('single');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loadingState, setLoadingState] = useState(false);

  const tabsList = [
    { id: 'buttons', label: 'Buttons & Actions', icon: 'MousePointer' },
    { id: 'forms', label: 'Form Controls', icon: 'Sliders' },
    { id: 'feedback', label: 'Feedback & Modals', icon: 'Bell' },
    { id: 'data', label: 'Data Display & Cards', icon: 'LayoutGrid' },
    { id: 'i18n', label: 'Localization (i18n)', icon: 'Globe' },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Catalog Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <Breadcrumb
            items={[
              { label: t('navigation.home'), href: '/' },
              { label: 'UI Component Library & Design System' },
            ]}
          />
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
            AetherPix UI Design System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            A standardized, accessible, and high-performance component kit built for client-side image and PDF utilities with 11-language localization and full RTL support.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher variant="dropdown" />
        </div>
      </div>

      {/* Main Category Tabs */}
      <Tabs
        tabs={tabsList}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="pills"
        size="md"
      />

      {/* TAB 1: BUTTONS & ACTIONS */}
      {activeTab === 'buttons' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants & Hierarchy</CardTitle>
              <CardDescription>
                Primary, secondary, destructive, ghost, outline, success, and premium styles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" leftIcon="Zap">
                  Primary Action
                </Button>
                <Button variant="secondary" leftIcon="Sliders">
                  Secondary Action
                </Button>
                <Button variant="outline" leftIcon="FileText">
                  Outline
                </Button>
                <Button variant="ghost" leftIcon="Share2">
                  Ghost
                </Button>
                <Button variant="success" leftIcon="Check">
                  Success Action
                </Button>
                <Button variant="destructive" leftIcon="Trash2">
                  Destructive
                </Button>
                <Button variant="premium" leftIcon="Crown">
                  Pro Premium
                </Button>
                <Button variant="link">Link Style</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sizes, Loading & Specialized Buttons</CardTitle>
              <CardDescription>
                IconButtons, copy helpers, download actions, and animated state toggles.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs" variant="secondary">Size XS</Button>
                  <Button size="sm" variant="secondary">Size SM</Button>
                  <Button size="md" variant="secondary">Size MD (Default)</Button>
                  <Button size="lg" variant="secondary">Size LG</Button>
                  <Button size="xl" variant="secondary">Size XL</Button>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <LoadingButton
                    variant="primary"
                    loading={loadingState}
                    loadingText="Processing Image..."
                    onClick={() => {
                      setLoadingState(true);
                      setTimeout(() => setLoadingState(false), 2000);
                    }}
                  >
                    Click to Test Async Loading
                  </LoadingButton>

                  <CopyButton value="https://aetherpix.studio/tools/compress-pdf" />
                  <DownloadButton
                    onClick={() => showToast('Starting download...', 'info')}
                    fileSize={1428500}
                    format="pdf"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <IconButton icon="Heart" aria-label="Favorite" variant="secondary" size="md" />
                  <IconButton icon="Share2" aria-label="Share" variant="outline" size="md" />
                  <IconButton icon="RotateCw" aria-label="Refresh" variant="ghost" size="md" />
                  <IconButton icon="Trash2" aria-label="Delete" variant="destructive" size="md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 2: FORM CONTROLS */}
      {activeTab === 'forms' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Text & Numerical Inputs</CardTitle>
              <CardDescription>Standard inputs, clearable search, and clamped number spinners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField label="Standard Input with Helper" helperText="Enter custom output prefix">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="e.g. compressed_photo"
                  clearable
                  onClear={() => setInputValue('')}
                  leftIcon="FileText"
                />
              </FormField>

              <FormField label="Search Input with Shortcut">
                <SearchInput placeholder="Search across 100+ tools..." shortcut="⌘K" />
              </FormField>

              <FormField label="Exact Target Size (KB)">
                <NumberInput
                  value={numberVal}
                  onChange={setNumberVal}
                  min={5}
                  max={50000}
                  step={25}
                  unit="KB"
                />
              </FormField>

              <FormField label="Multilingual Textarea with Character Limit">
                <Textarea
                  value={textareaVal}
                  onChange={(e) => setTextareaVal(e.target.value)}
                  maxCharacters={150}
                  rows={3}
                />
              </FormField>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Selection & Toggle Controls</CardTitle>
              <CardDescription>Select dropdowns, sliders, switches, segmented bars, and checkboxes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField label="Target Format Selection (Native)">
                <Select
                  value={selectVal}
                  onChange={(e) => setSelectVal(e.target.value)}
                  options={[
                    { value: 'webp', label: 'WebP (Ultra compact, modern web standard)' },
                    { value: 'jpg', label: 'JPEG (High compatibility standard)' },
                    { value: 'png', label: 'PNG (Lossless transparency preservation)' },
                    { value: 'pdf', label: 'PDF (Single multi-page document)' },
                  ]}
                />
              </FormField>

              <FormField label="Searchable Dropdown (Promptly CustomSelect)">
                <CustomSelect
                  value={customSelectVal}
                  onChange={setCustomSelectVal}
                  isSearchable
                  options={[
                    { value: 'webp', label: 'WebP Image', description: 'Next-gen image format with high compression' },
                    { value: 'jpg', label: 'JPEG Image', description: 'Universal format supported across all devices' },
                    { value: 'png', label: 'PNG Image', description: 'Lossless format supporting full transparency' },
                    { value: 'pdf', label: 'PDF Document', description: 'Multi-page document format for archiving' },
                  ]}
                />
              </FormField>

              <FormField label="Multi-Select Pipeline (Promptly Tags)">
                <CustomSelect
                  value={multiSelectVal}
                  onChange={setMultiSelectVal}
                  isMulti
                  isSearchable
                  placeholder="Select batch operations..."
                  options={[
                    { value: 'resize', label: 'Resize Dimensions', description: 'Scale resolution proportionally' },
                    { value: 'compress', label: 'Compress File Size', description: 'Reduce KB size with zero quality loss' },
                    { value: 'watermark', label: 'Apply Watermark', description: 'Stamp brand text or image overlay' },
                    { value: 'convert', label: 'Format Conversion', description: 'Convert between WebP, PNG, JPG' },
                  ]}
                />
              </FormField>

              <FormField label="Batch Processing Mode">
                <SegmentedControl
                  value={segVal}
                  onChange={setSegVal}
                  options={[
                    { value: 'single', label: 'Single File' },
                    { value: 'batch', label: 'Batch Processing', badge: '50x' },
                    { value: 'preset', label: 'Custom Preset' },
                  ]}
                />
              </FormField>

              <Slider
                label="Compression Quality Level"
                value={sliderVal}
                onChange={setSliderVal}
                min={10}
                max={100}
                unit="%"
              />

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <Switch
                  checked={switchVal}
                  onChange={setSwitchVal}
                  label="Preserve Alpha Transparency"
                  description="Maintains transparent PNG/WebP layers without black background artifacts."
                />

                <Checkbox
                  checked={checkboxVal}
                  onChange={(e) => setCheckboxVal(e.target.checked)}
                  label="Strip EXIF Metadata"
                  description="Removes GPS coordinates, camera models, and timestamps for 100% privacy."
                />
              </div>

              <RadioGroup
                name="compressionPreset"
                value={radioVal}
                onChange={setRadioVal}
                options={[
                  { value: 'recommended', label: 'Recommended (Balanced Quality & Size)' },
                  { value: 'lossless', label: 'Lossless (Pixel Perfect)' },
                  { value: 'max', label: 'Extreme Compression (Smallest File)' },
                ]}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 3: FEEDBACK & MODALS */}
      {activeTab === 'feedback' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Alerts & Callouts</CardTitle>
              <CardDescription>Informative notices for status, privacy, warnings, and errors.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert variant="info" title="Zero Server Exposure">
                All image compression, PDF merging, and OCR algorithms run client-side in WebAssembly.
              </Alert>
              <Alert variant="success" title="Processing Complete">
                Successfully reduced 4 files by 78.4% (saved 14.8 MB).
              </Alert>
              <Alert variant="warning" title="Large Batch Warning">
                Processing more than 20 high-resolution images simultaneously may use substantial browser memory.
              </Alert>
              <Alert variant="error" title="Password Protected PDF">
                The uploaded PDF is encrypted. Please enter the password to unlock and merge pages.
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dialogs, Progress & Spinners</CardTitle>
              <CardDescription>Modal windows, confirmation gates, and indeterminate progress states.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Open Standard Modal
                </Button>
                <Button variant="destructive" onClick={() => setIsConfirmOpen(true)}>
                  Open Confirm Dialog
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => showToast('Document saved successfully!', 'success')}
                >
                  Trigger Toast Notification
                </Button>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Progress value={68} showLabel label="Batch Processing Progress (34 of 50 files)" />
                <Progress value={100} variant="success" showLabel label="Complete" />

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Spinner size="sm" variant="primary" />
                    <span className="text-xs text-slate-500">Spinner SM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="md" variant="primary" />
                    <span className="text-xs text-slate-500">Spinner MD</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Spinner size="lg" variant="primary" />
                    <span className="text-xs text-slate-500">Spinner LG</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="rounded" height={60} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* TAB 4: DATA DISPLAY & CARDS */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Badges & Filter Chips</CardTitle>
              <CardDescription>Status indicators, feature chips, and removable category tags.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary" dot>Client-Side</Badge>
                <Badge variant="success" dot>100% Free</Badge>
                <Badge variant="warning">Draft</Badge>
                <Badge variant="danger">Rate Limited</Badge>
                <Badge variant="info">WebP</Badge>
                <Badge variant="premium" icon="Crown">Pro Tier</Badge>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Chip label="All Tools" selected />
                <Chip label="PDF Tools" />
                <Chip label="Images" />
                <Chip label="Converters" />
                <Chip label="Removable Tag" onRemove={() => showToast('Removed tag', 'info')} />
              </div>
            </CardContent>
          </Card>

          {/* Full Advanced DataTable Showcase matching reference */}
          <Card>
            <CardHeader>
              <CardTitle>Advanced Common DataTable Component</CardTitle>
              <CardDescription>
                High-performance unified table matching reference layout with instant live search, customizable page limit, columns toggle popover, multi-format export (CSV, JSON, PDF), multi-row selection, and sorting.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                data={[
                  {
                    id: 'usr-1',
                    name: 'Chintan Dudhat',
                    email: 'admin@promptly.com',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
                    role: 'Admin',
                    interests: [],
                    lastActive: 'Yesterday',
                    joined: '5/18/2026',
                    credits: 850,
                    status: 'Active',
                  },
                  {
                    id: 'usr-2',
                    name: 'Chintan Dudhat',
                    email: 'chintandudhat1286@gmail.com',
                    role: 'Admin',
                    interests: ['creative'],
                    lastActive: '5/27/2026',
                    joined: '5/15/2026',
                    credits: 1200,
                    status: 'Active',
                  },
                  {
                    id: 'usr-3',
                    name: 'Bansari Hirapara',
                    email: 'bansari.techwrd016@gmail.com',
                    role: 'Prompt Writer',
                    interests: ['marketing', 'creative'],
                    lastActive: '5/20/2026',
                    joined: '5/6/2026',
                    credits: 420,
                    status: 'Active',
                  },
                  {
                    id: 'usr-4',
                    name: 'learnwithdudhat',
                    email: 'learnwithdudhat016@gmail.com',
                    role: 'User',
                    interests: ['marketing', 'coding'],
                    lastActive: '5/13/2026',
                    joined: '5/4/2026',
                    credits: 150,
                    status: 'Active',
                  },
                  {
                    id: 'usr-5',
                    name: 'calming sound',
                    email: 'calmingsound016@gmail.com',
                    role: 'Admin',
                    interests: [],
                    lastActive: '6/23/2026',
                    joined: '5/1/2026',
                    credits: 980,
                    status: 'Active',
                  },
                  {
                    id: 'usr-6',
                    name: 'Sarah Jenkins',
                    email: 'sarah.j@aetherpix.io',
                    role: 'Pro Creator',
                    interests: ['creative', 'design'],
                    lastActive: '5/28/2026',
                    joined: '4/12/2026',
                    credits: 640,
                    status: 'Active',
                  },
                  {
                    id: 'usr-7',
                    name: 'Alex Rivera',
                    email: 'alex.rivera@designlab.org',
                    role: 'Prompt Writer',
                    interests: ['coding', 'ai'],
                    lastActive: '5/19/2026',
                    joined: '3/29/2026',
                    credits: 310,
                    status: 'Active',
                  },
                  {
                    id: 'usr-8',
                    name: 'Priya Sharma',
                    email: 'priya.s@cloudstudio.in',
                    role: 'Business',
                    interests: ['marketing', 'creative', 'enterprise'],
                    lastActive: '5/26/2026',
                    joined: '2/18/2026',
                    credits: 2400,
                    status: 'Active',
                  },
                ]}
                columns={[
                  {
                    id: 'user',
                    header: 'USER',
                    sortable: true,
                    accessorFn: (r) => r.name,
                    exportFormatter: (r) => `${r.name} (${r.email})`,
                    cell: ({ row }) => (
                      <div className="flex items-center gap-3">
                        {row.avatar ? (
                          <img
                            src={row.avatar}
                            alt={row.name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {row.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{row.name}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{row.email}</div>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'role',
                    header: 'ROLE',
                    sortable: true,
                    accessorKey: 'role',
                    cell: ({ row }) => (
                      <div className="relative inline-block">
                        <select
                          defaultValue={row.role}
                          onChange={(e) => showToast(`Updated ${row.name} role to ${e.target.value}`, 'success')}
                          className="appearance-none pl-3 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-slate-900 dark:text-white font-bold text-xs hover:border-slate-300 dark:hover:border-slate-700 focus:outline-none focus:border-purple-500 cursor-pointer shadow-xs"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Prompt Writer">Prompt Writer</option>
                          <option value="Pro Creator">Pro Creator</option>
                          <option value="Business">Business</option>
                          <option value="User">User</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
                          <span className="text-[10px]">⌄</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    id: 'interests',
                    header: 'INTERESTS',
                    sortable: false,
                    cell: ({ row }) =>
                      row.interests.length > 0 ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          {row.interests.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">No interests</span>
                      ),
                  },
                  {
                    id: 'lastActive',
                    header: 'LAST ACTIVE',
                    sortable: true,
                    accessorKey: 'lastActive',
                    cell: ({ row }) => (
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
                        <span className="text-emerald-500">🕒</span>
                        <span className={row.lastActive === 'Yesterday' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}>
                          {row.lastActive}
                        </span>
                      </div>
                    ),
                  },
                  {
                    id: 'joined',
                    header: 'JOINED',
                    sortable: true,
                    accessorKey: 'joined',
                    cell: ({ row }) => (
                      <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">{row.joined}</span>
                    ),
                  },
                  {
                    id: 'actions',
                    header: '',
                    sortable: false,
                    hideable: false,
                    align: 'right',
                    cell: ({ row }) => (
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        <button
                          type="button"
                          onClick={() => showToast(`Editing user: ${row.name}`, 'info')}
                          className="p-1.5 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => showToast(`Archived user: ${row.name}`, 'info')}
                          className="p-1.5 rounded-lg hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    ),
                  },
                ]}
                keyExtractor={(item) => item.id}
                searchPlaceholder="Search by name or email..."
                enableSelection={true}
                defaultPageSize={5}
                pageSizeOptions={[5, 10, 20, 50]}
                exportFileName="sample_users_data"
                selectedActions={({ selectedIds }) => (
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => showToast(`Batch action on ${selectedIds.length} users`, 'success')}
                  >
                    Bulk Edit ({selectedIds.length})
                  </Button>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Basic Responsive Table</CardTitle>
              <CardDescription>Accessible lightweight tabular view for static specifications.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Original</TableHead>
                    <TableHead>Optimized</TableHead>
                    <TableHead>Savings</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      catalog_presentation_2026.pdf
                    </TableCell>
                    <TableCell>8.4 MB</TableCell>
                    <TableCell className="font-mono text-emerald-600 font-bold">1.2 MB</TableCell>
                    <TableCell>
                      <Badge variant="success">-85.7%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Completed</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      hero_banner_ultra_hd.png
                    </TableCell>
                    <TableCell>4.2 MB</TableCell>
                    <TableCell className="font-mono text-emerald-600 font-bold">380 KB</TableCell>
                    <TableCell>
                      <Badge variant="success">-91.0%</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">Completed</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Accordion
            items={[
              {
                id: 'faq-1',
                title: 'How does client-side WebAssembly compression protect privacy?',
                content:
                  'Files are decoded directly into browser Canvas elements or processed inside isolated WebAssembly binaries without transmitting any binary data across network sockets.',
                icon: 'ShieldCheck',
                defaultOpen: true,
              },
              {
                id: 'faq-2',
                title: 'What are the exact size constraints for batch conversion?',
                content:
                  'Our asynchronous batch worker queues up to 50 items simultaneously with a recommended maximum file size of 100MB per document.',
                icon: 'Layers',
              },
            ]}
          />
        </div>
      )}

      {/* TAB 5: LOCALIZATION */}
      {activeTab === 'i18n' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <Card>
            <CardHeader>
              <CardTitle>Live Internationalization Preview (Current: {language})</CardTitle>
              <CardDescription>
                Test real-time string translations across all 11 supported languages and inspect RTL layout adaptations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">App Tagline:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {t('common.tagline')}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Privacy Guarantee:</span>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {t('common.privacyBadge')}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">PDF Merge Title:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {t('pdf.mergeTitle')}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase">Upload Dropzone:</span>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
                    {t('upload.dropFilesHere')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Interactive Modals for Demonstration */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Reusable Accessible Modal"
        description="Supports focus trapping, background blur, and customizable footer actions."
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Close
            </Button>
            <Button variant="primary" onClick={() => setIsModalOpen(false)}>
              Save Settings
            </Button>
          </>
        }
      >
        <p className="text-sm text-slate-600 dark:text-slate-300">
          This modal dialog conforms to modern accessibility patterns, closes on Escape, and prevents page scroll leaks.
        </p>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={() => {
          setIsConfirmOpen(false);
          showToast('History cleared safely', 'success');
        }}
        title="Clear All Local History?"
        message="This action will remove all saved conversion records from this browser. Your original files will remain untouched on your device."
        confirmLabel="Yes, Clear History"
        cancelLabel="Keep History"
      />
    </div>
  );
};
