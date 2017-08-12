class AddStartPageToWiki < ActiveRecord::Migration[4.2]
  def change
    add_column :wikis, :start_page_id, :integer
  end
end
