class User < ActiveRecord::Base
  has_secure_password
  has_many :requests, class_name: "Story", foreign_key: "requestor_id"

end
