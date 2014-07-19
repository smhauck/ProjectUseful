class Blog < ActiveRecord::Base
  belongs_to :user
  has_many :posts, class_name: "BlogPost"
end
