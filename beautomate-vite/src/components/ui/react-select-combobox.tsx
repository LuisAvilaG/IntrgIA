"use client"

import React from 'react';
import Select, { StylesConfig } from 'react-select';
import { useTheme } from 'next-themes'; // Asumiendo que puedes tener un tema oscuro/claro

export interface ComboboxOption {
    value: string;
    label: string;
}

interface ReactSelectComboboxProps {
    options: ComboboxOption[];
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    id?: string;
}

// Estilos para que react-select se parezca a shadcn/ui
const getCustomStyles = (): StylesConfig<ComboboxOption, false> => ({
    control: (provided, state) => ({
        ...provided,
        backgroundColor: 'transparent',
        borderColor: state.isFocused ? 'hsl(240 5.9% 90%)' : 'hsl(240 5.9% 90%)',
        boxShadow: state.isFocused ? '0 0 0 1px hsl(240 5.9% 90%)' : 'none',
        '&:hover': {
            borderColor: 'hsl(240 5.9% 90%)'
        },
        minHeight: '40px',
    }),
    singleValue: (provided) => ({
        ...provided,
        color: 'hsl(240 10% 3.9%)',
    }),
    input: (provided) => ({
        ...provided,
        color: 'hsl(240 10% 3.9%)',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: 'white',
        borderRadius: '8px',
        zIndex: 50,
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? 'hsl(240 5.9% 90%)' : state.isFocused ? 'hsl(240 4.8% 95.9%)' : 'white',
        color: 'hsl(240 10% 3.9%)',
        '&:active': {
            backgroundColor: 'hsl(240 5.9% 90%)'
        }
    }),
    placeholder: (provided) => ({
        ...provided,
        color: 'hsl(240 3.8% 46.1%)'
    }),
});


export function ReactSelectCombobox({
    options,
    value,
    onChange,
    placeholder = "Select...",
    disabled,
    id,
}: ReactSelectComboboxProps) {

    const selectedOption = options.find(option => option.value === value) || null;

    const handleChange = (selected: ComboboxOption | null) => {
        onChange(selected ? selected.value : '');
    };

    return (
        <Select
            id={id}
            options={options}
            value={selectedOption}
            onChange={handleChange}
            placeholder={placeholder}
            isDisabled={disabled}
            styles={getCustomStyles()}
            isClearable
            isSearchable
        />
    );
}
