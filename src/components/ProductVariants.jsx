import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function ProductVariants({ variants = [], onVariantChange, selectedVariants = {} }) {
  const [localSelected, setLocalSelected] = useState(selectedVariants);

  useEffect(() => {
    setLocalSelected(selectedVariants);
  }, [selectedVariants]);

  const handleVariantSelect = (variantType, optionValue) => {
    const newSelected = {
      ...localSelected,
      [variantType]: optionValue
    };
    setLocalSelected(newSelected);
    onVariantChange?.(newSelected);
  };

  const getSelectedOption = (variantType) => {
    return localSelected[variantType];
  };

  const getVariantPriceModifier = (variantType, optionValue) => {
    const variant = variants.find(v => v.type === variantType);
    const option = variant?.options.find(opt => opt.value === optionValue);
    return option?.price_modifier || 0;
  };

  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Personaliza tu producto</h3>

      {variants.map((variant) => (
        <div key={variant.type} className="space-y-3">
          <h4 className="font-medium text-gray-900">{variant.name}</h4>

          {variant.type === 'color' ? (
            // Color picker
            <div className="flex flex-wrap gap-3">
              {variant.options.map((option) => {
                const isSelected = getSelectedOption(variant.type) === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleVariantSelect(variant.type, option.value)}
                    className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-4 ring-blue-200'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: option.value }}
                    title={option.label}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white drop-shadow-lg" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            // Select normal para otros tipos
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {variant.options.map((option) => {
                const isSelected = getSelectedOption(variant.type) === option.value;
                const priceMod = getVariantPriceModifier(variant.type, option.value);

                return (
                  <button
                    key={option.value}
                    onClick={() => handleVariantSelect(variant.type, option.value)}
                    className={`relative p-3 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{option.label}</span>
                      {priceMod !== 0 && (
                        <span className={`text-sm font-medium ${
                          priceMod > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {priceMod > 0 ? '+' : ''}${priceMod}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Check className="absolute top-2 right-2 w-4 h-4 text-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Mostrar selección actual */}
          {getSelectedOption(variant.type) && (
            <div className="text-sm text-gray-600">
              Seleccionado: {
                variant.options.find(opt => opt.value === getSelectedOption(variant.type))?.label
              }
              {getVariantPriceModifier(variant.type, getSelectedOption(variant.type)) !== 0 && (
                <span className={`ml-2 font-medium ${
                  getVariantPriceModifier(variant.type, getSelectedOption(variant.type)) > 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}>
                  ({getVariantPriceModifier(variant.type, getSelectedOption(variant.type)) > 0 ? '+' : ''}
                  ${getVariantPriceModifier(variant.type, getSelectedOption(variant.type))})
                </span>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Resumen de modificadores de precio */}
      {Object.keys(localSelected).length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Resumen de personalización:</h4>
          <div className="space-y-1 text-sm">
            {Object.entries(localSelected).map(([type, value]) => {
              const variant = variants.find(v => v.type === type);
              const option = variant?.options.find(opt => opt.value === value);
              if (!option || option.price_modifier === 0) return null;

              return (
                <div key={type} className="flex justify-between">
                  <span>{variant.name}: {option.label}</span>
                  <span className={option.price_modifier > 0 ? 'text-green-600' : 'text-red-600'}>
                    {option.price_modifier > 0 ? '+' : ''}${option.price_modifier}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

