require 'date'
require 'time'
require 'socket'
require 'watir-webdriver'
require 'minitest/autorun'
require 'minitest/spec'
include Selenium

describe "Example Selenium Tests" do

    before :each do
      @b = Watir::Browser.new :firefox
    end

    after :each do
      @b.close
    end

    describe "login acceptance tests" do
      it "should show a login page at the root of the web app" do
        @b.goto "http://127.0.0.1:8000/"
        assert @b.text_field(:id => "id_username").visible?
        assert @b.text_field(:id => "id_password").visible?
      end

    end
end
