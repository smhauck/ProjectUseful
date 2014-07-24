class Blog < ActiveRecord::Base
  belongs_to :creator, class_name: "User"
  has_many :posts, class_name: "BlogPost", :order => "publish_date DESC"
end
