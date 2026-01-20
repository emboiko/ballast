import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingRegionField = ({ value, onChange, isRequired, isDisabled }) => {
  return (
    <UserInfoField
      id="billing-region"
      label="State / Region"
      value={value}
      onChange={onChange}
      placeholder="State or region"
      autoComplete="address-level1"
      maxLength={100}
      isRequired={isRequired}
      isDisabled={isDisabled}
    />
  )
}

export default BillingRegionField
