class CreateBlogPosts < ActiveRecord::Migration[4.2]
  def change
    create_table :blog_posts do |t|
      t.string :title
      t.text :body
      t.date :publish_date
      t.references :blog, index: true
      t.references :user, index: true

      t.timestamps
    end
  end
end
