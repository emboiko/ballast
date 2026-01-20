import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const BillingAddressLine2Field = ({ value, onChange, isDisabled }) => {
  return (
    <UserInfoField
      id="billing-address-line2"
      label="Address line 2"
      value={value}
      onChange={onChange}
      placeholder="Apartment, suite, etc. (optional)"
      autoComplete="address-line2"
      maxLength={200}
      isRequired={false}
      isDisabled={isDisabled}
      span={2}
    />
  )
}

export default BillingAddressLine2Field
