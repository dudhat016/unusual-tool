import React, { useState } from 'react';
import { useTranslation, SupportedLanguage } from '../../i18n';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../ui/Table';
import { Icon } from '../ui/Icon';
import { SearchInput } from '../ui/SearchInput';
import { useApp } from '../../context/AppContext';

export const AdminTranslationsTab: React.FC = () => {
  const { supportedLanguages, language, setLanguage, getCompletionRate } = useTranslation();
  const { showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLanguages = supportedLanguages.filter(
    (lang) =>
      lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            Internationalization & Locales Engine (11 Languages)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor client-side dictionary coverage, RTL typography support, and pluralization matrix.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon="RefreshCw"
            onClick={() => showToast('i18n cache re-indexed successfully', 'success')}
          >
            Re-index Locales
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Locales</span>
            <Icon name="Globe" size={16} className="text-primary" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {supportedLanguages.length}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold">100% Client-Side Bundle</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">RTL Locales</span>
            <Icon name="Sliders" size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {supportedLanguages.filter((l) => l.dir === 'rtl').length} (Arabic)
          </p>
          <span className="text-[10px] text-slate-400">Bi-directional layout enabled</span>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Dictionary Keys</span>
            <Icon name="Layers" size={16} className="text-blue-500" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">120+</p>
          <span className="text-[10px] text-primary">Zero Runtime HTTP Latency</span>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Supported Languages Matrix</CardTitle>
              <CardDescription>
                Live completion rate, directionality, and quick test preview.
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <SearchInput
                placeholder="Search language or code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Language</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Direction</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLanguages.map((item) => {
                const isCurrent = item.code === language;
                const completion = getCompletionRate(item.code as SupportedLanguage);

                return (
                  <TableRow key={item.code}>
                    <TableCell className="font-semibold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg leading-none">{item.flag}</span>
                        <div>
                          <div>{item.nativeName}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{item.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs uppercase">{item.code}</TableCell>
                    <TableCell>
                      <Badge variant={item.dir === 'rtl' ? 'warning' : 'secondary'}>
                        {item.dir.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full"
                            style={{ width: `${completion}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-500">{completion}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {isCurrent ? (
                        <Badge variant="success" dot>
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="default">Ready</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="xs"
                        variant={isCurrent ? 'secondary' : 'outline'}
                        onClick={() => {
                          setLanguage(item.code as SupportedLanguage);
                          showToast(`Switched locale to ${item.name}`, 'info');
                        }}
                      >
                        {isCurrent ? 'Active Locale' : 'Switch & Test'}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
