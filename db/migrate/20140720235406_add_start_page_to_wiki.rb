class AddStartPageToWiki < ActiveRecord::Migration
  def change
    add_column :wikis, :start_page_id, :integer
  end
end
