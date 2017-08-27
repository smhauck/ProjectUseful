class Contact < ApplicationRecord
  belongs_to :sex
  has_many :contact_emails
end
