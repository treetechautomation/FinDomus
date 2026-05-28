'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Company = {
  id?: string;
  name: string;
};

export function CompanyFilter({
  companies,
  selectedCompanyId,
}: {
  companies: Company[];
  selectedCompanyId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('companyId', value);
    router.push(`/empresas?${params.toString()}`);
  }

  return (
    <Select value={selectedCompanyId} onValueChange={handleChange}>
      <SelectTrigger className="w-[240px]">
        <SelectValue placeholder="Selecionar Empresa" />
      </SelectTrigger>
      <SelectContent>
        {companies.map((company) => (
          <SelectItem key={company.id} value={company.id!}>
            {company.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
