import React, {useEffect, useState} from 'react';
import {Checkbox, FormControlLabel, FormGroup, Radio, RadioGroup, TextField} from '@mui/material';
import {FieldTypeDefinition, ModelName} from '../types/types';

interface FlatListFieldProps<T extends ModelName> {
    field: FieldTypeDefinition;
    value: any;
    onChange: (value: any) => void;
    topass?: any;
    index?: number;
}

const FlatListField = <T extends ModelName>({
                                                field,
                                                value,
                                                onChange,
                                                topass = {},
                                                index = 0
                                            }: FlatListFieldProps<T>) => {
    const [otherValue, setOtherValue] = useState<string>('');
    const [selectedValues, setSelectedValues] = useState<string[]>([]);

    // Initialize selected values from the field value
    useEffect(() => {
        if (value) {
            const values = typeof value === 'string' ? value.split(',') : Array.isArray(value) ? value : [];
            setSelectedValues(values);

            // Extract "Other" value if it exists
            const otherOption = values.find(v =>
                v.toLowerCase().includes('other') ||
                v.toLowerCase().startsWith('other:')
            );
            if (otherOption) {
                const otherText = otherOption.replace(/^other:\s*/i, '');
                setOtherValue(otherText);
            } else {
                setOtherValue('');
            }
        } else {
            setSelectedValues([]);
            setOtherValue('');
        }
    }, [value]);

    const handleOptionChange = (optionLabel: string, checked: boolean) => {
        let newSelected: string[];

        if (field.cardinality && field.cardinality > 1) {
            // Multiple selection (checkboxes)
            if (checked) {
                newSelected = [...selectedValues, optionLabel];
            } else {
                newSelected = selectedValues.filter(v => v.toLowerCase() !== optionLabel.toLowerCase());
            }
        } else {
            // Single selection (radio buttons)
            newSelected = checked ? [optionLabel] : [];
        }

        console.log(field.machine, newSelected);

        setSelectedValues(newSelected);
        onChange(newSelected.join(','));
    };

    const handleOtherChange = (otherText: string) => {
        setOtherValue(otherText);

        // Remove any existing "Other" entries
        const withoutOther = selectedValues.filter(v =>
            !v.toLowerCase().includes('other') &&
            !v.toLowerCase().startsWith('other:')
        );

        // Add new "Other" entry if there's text
        const newSelected = otherText.trim()
            ? [...withoutOther, `Other: ${otherText.trim()}`]
            : withoutOther;

        setSelectedValues(newSelected);

        console.log(field.machine, newSelected);
        onChange(newSelected.join(','));
    };

    const isOptionSelected = (optionLabel: string): boolean => {
        return selectedValues.some(v => v.toLowerCase() === optionLabel.toLowerCase());
    };

    const hasOtherSelected = (): boolean => {
        return selectedValues.some(v =>
            v.toLowerCase().includes('other') ||
            v.toLowerCase().startsWith('other:')
        );
    };

    if (!field.options) {
        return (
            <TextField
                name={field.machine}
                label={field.singular}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                {...topass}
            />
        );
    }

    const selectBoxes = field.options.map((option) => {
        const isSelected = isOptionSelected(option.label);

        if (field.cardinality && field.cardinality > 1) {
            // Multiple selection with checkboxes
            return (
                <FormControlLabel
                    key={option.id}
                    value={option.label}
                    label={option.label}
                    control={
                        <Checkbox
                            checked={isSelected}
                            value={option.label}
                            onChange={(e) => handleOptionChange(option.label, e.target.checked)}
                        />
                    }
                    {...topass}
                />
            );
        } else {
            // Single selection with radio buttons
            return (
                <FormControlLabel
                    key={option.id}
                    value={option.label}
                    label={option.label}
                    control={
                        <Radio
                            checked={isSelected}
                            value={option.label}
                            onChange={(e) => handleOptionChange(option.label, e.target.checked)}
                        />
                    }
                    {...topass}
                />
            );
        }
    });

    // Add "Other" option if it exists in the options
    const hasOtherOption = field.options.some(opt =>
        opt.label.toLowerCase().includes('other')
    );

    if (hasOtherOption) {
        // Show text field if "Other" is selected or if user is typing in it
        if (hasOtherSelected() || otherValue.trim() !== '') {
            selectBoxes.push(
                <TextField
                    key="other-text"
                    placeholder={`Other: ${field.singular}`}
                    value={otherValue}
                    onChange={(e) => handleOtherChange(e.target.value)}
                    sx={{ml: 4, mt: 1}}
                    size="small"
                    {...topass}
                />
            );
        }
    }

    const ElWrapper = (field.cardinality && field.cardinality > 1) ? FormGroup : RadioGroup;

    return (
        <ElWrapper
            name={field.machine}
            row={field.cardinality === 1}
        >
            {selectBoxes}
        </ElWrapper>
    );
};

export default FlatListField;
