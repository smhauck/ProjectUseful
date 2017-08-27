class ContactEmail < ApplicationRecord
  belongs_to :contact
  belongs_to :email_type
end
