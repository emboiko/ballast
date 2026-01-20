import UserInfoField from "@/components/userInfo/fields/UserInfoField"

const FullNameField = ({ value, onChange, isRequired, isDisabled }) => {
  return (
    <UserInfoField
      id="user-full-name"
      label="Full name"
      value={value}
      onChange={onChange}
      placeholder="Full name"
      autoComplete="name"
      maxLength={200}
      isRequired={isRequired}
      isDisabled={isDisabled}
      span={1}
    />
  )
}

export default FullNameField
